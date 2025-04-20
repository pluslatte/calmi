// src/components/NoteComposer.tsx
'use client';

import { Button, Paper, Textarea, Select, Group, Text, FileButton, Image, Stack, ActionIcon, Loader, SegmentedControl, Box, Flex, Grid, Tooltip, Switch, Collapse } from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconHome, IconLock, IconMail, IconPhoto, IconPlus, IconSend, IconUsers, IconWorld, IconX } from '@tabler/icons-react';

type VisibilityOption = 'public' | 'home' | 'followers' | 'specified';

interface NoteComposerProps {
    onSuccess?: () => void; // 投稿成功時のコールバック
}

interface ImagePreview {
    file: File;
    preview: string;
}

// 許可される最大ファイルサイズ（8MB）
const MAX_FILE_SIZE = 8 * 1024 * 1024;
// 添付可能な最大画像数
const MAX_IMAGES = 4;

export default function NoteComposer({ onSuccess }: NoteComposerProps) {
    const [text, setText] = useState('');
    const [cw, setCw] = useState('');
    const [enableCw, setEnableCw] = useState(false);
    const [visibility, setVisibility] = useState<VisibilityOption>('home');
    const [imageFiles, setImageFiles] = useState<ImagePreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const resetRef = useRef<() => void>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const { createNote, createNoteWithMedia, uploadFile, apiState } = useMisskeyApiStore();

    // ファイル処理の共通関数
    const processFile = (file: File): Promise<ImagePreview | null> => {
        return new Promise((resolve) => {
            // ファイルタイプが画像かチェック
            if (!file.type.startsWith('image/')) {
                notifications.show({
                    title: 'ファイルエラー',
                    message: '画像ファイルのみアップロードできます',
                    color: 'red',
                });
                resolve(null);
                return;
            }

            // ファイルサイズチェック
            if (file.size > MAX_FILE_SIZE) {
                notifications.show({
                    title: 'ファイルエラー',
                    message: 'ファイルサイズは8MB以下にしてください',
                    color: 'red',
                });
                resolve(null);
                return;
            }

            // 最大枚数チェック
            if (imageFiles.length >= MAX_IMAGES) {
                notifications.show({
                    title: 'ファイルエラー',
                    message: `画像は最大${MAX_IMAGES}枚までです`,
                    color: 'red',
                });
                resolve(null);
                return;
            }

            // プレビューを作成
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    resolve({
                        file,
                        preview: e.target.result as string
                    });
                } else {
                    resolve(null);
                }
            };
            reader.onerror = () => {
                notifications.show({
                    title: 'ファイルエラー',
                    message: 'ファイルの読み込みに失敗しました',
                    color: 'red',
                });
                resolve(null);
            };
            reader.readAsDataURL(file);
        });
    };

    // ファイル選択ハンドラー
    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        const preview = await processFile(file);
        if (preview) {
            setImageFiles([...imageFiles, preview]);
        }
    };

    // ファイル削除ハンドラー
    const removeImage = (index: number) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
    };

    // ドラッグ＆ドロップイベントハンドラー
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);

        // 画像以外のファイルをフィルタリング
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            notifications.show({
                title: '情報',
                message: '画像ファイルをドロップしてください',
                color: 'blue',
            });
            return;
        }

        // 最大枚数を超える場合は警告
        const remainingSlots = MAX_IMAGES - imageFiles.length;
        if (remainingSlots < 0) {
            notifications.show({
                title: '警告',
                message: `画像は最大${MAX_IMAGES}枚までです。最初の${MAX_IMAGES}枚のみ追加します。`,
                color: 'yellow',
            });
        }

        // 処理する画像数を制限
        const filesToProcess = imageFiles.slice(0, remainingSlots > 0 ? imageFiles.length : MAX_IMAGES);

        // 非同期で全ファイルを処理
        const previewPromises = filesToProcess.map(file => processFile(file));
        const previews = await Promise.all(previewPromises);

        // 有効なプレビューのみをフィルタリング
        const validPreviews = previews.filter((preview): preview is ImagePreview => preview !== null);

        if (validPreviews.length > 0) {
            setImageFiles(prev => [...prev, ...validPreviews]);
        }
    };

    // クリップボードからのペースト処理
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (!e.clipboardData) return;

            const items = e.clipboardData.items;

            // クリップボードアイテムをチェック
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    // 画像データを取得
                    const file = items[i].getAsFile();
                    if (file) {
                        e.preventDefault(); // テキストエリアへのデフォルトのペーストを防止

                        if (imageFiles.length >= MAX_IMAGES) {
                            notifications.show({
                                title: 'ファイルエラー',
                                message: `画像は最大${MAX_IMAGES}枚までです`,
                                color: 'red',
                            });
                            return;
                        }

                        const preview = await processFile(file);
                        if (preview) {
                            setImageFiles(prev => [...prev, preview]);

                            notifications.show({
                                title: '画像追加',
                                message: 'クリップボードから画像を追加しました',
                                color: 'green',
                            });
                        }

                        // 一つの画像を処理したら終了
                        break;
                    }
                }
            }
        };

        // イベントリスナーを追加
        document.addEventListener('paste', handlePaste);

        // クリーンアップ
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [imageFiles]);

    const handleSubmit = async () => {
        // 本文もしくは画像がある場合のみ投稿可能
        if (!text.trim() && imageFiles.length === 0) {
            notifications.show({
                title: '投稿エラー',
                message: 'テキストまたは画像を入力してください',
                color: 'red',
            });
            return;
        }

        // CWが有効なのに内容が空の場合はエラー
        if (enableCw && !cw.trim()) {
            notifications.show({
                title: '投稿エラー',
                message: 'CWを有効にする場合は、警告内容を入力してください',
                color: 'red',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const cwText = enableCw ? cw : null;

            // 画像がある場合は先にアップロード
            if (imageFiles.length > 0) {
                setIsUploading(true);
                try {
                    // 複数画像を順次アップロード
                    const uploadPromises = imageFiles.map(image => uploadFile(image.file));
                    const uploadedFiles = await Promise.all(uploadPromises);
                    setIsUploading(false);

                    // 画像付きノートを作成
                    await createNoteWithMedia(
                        text,
                        uploadedFiles.map(file => file.id),
                        visibility,
                        cwText
                    );
                } catch (error) {
                    setIsUploading(false);
                    throw error;
                }
            } else {
                // テキストのみのノートを作成
                await createNote(
                    text,
                    visibility,
                    cwText
                );
            }

            // 成功したらフォームをクリア
            setText('');
            setCw('');
            setEnableCw(false);
            setImageFiles([]);

            notifications.show({
                title: '投稿成功',
                message: 'ノートを投稿しました',
                color: 'green',
                autoClose: 3000
            });

            // 成功コールバックがあれば実行（モーダルを閉じるなど）
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to create note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Paper
            p="md"
            withBorder
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            ref={dropZoneRef}
            style={{
                position: 'relative',
                borderColor: isDragOver ? '#228be6' : undefined,
                borderStyle: isDragOver ? 'dashed' : 'solid',
                transition: 'border-color 0.2s, border-style 0.2s',
            }}
        >
            {isDragOver && (
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        zIndex: 10,
                    }}
                >
                    <Stack align="center" gap="xs">
                        <IconPhoto size={32} />
                        <Text>画像をドロップして添付</Text>
                    </Stack>
                </Box>
            )}

            <Stack gap="sm">
                {/* CW入力エリア（CWが有効な場合のみ表示） */}
                <Collapse in={enableCw}>
                    <Textarea
                        placeholder="閲覧注意の内容を入力（必須）"
                        value={cw}
                        onChange={(e) => setCw(e.target.value)}
                        autosize
                        minRows={1}
                        maxRows={2}
                        disabled={isSubmitting}
                        mb="xs"
                    />
                </Collapse>

                {/* 本文入力エリア */}
                <Textarea
                    placeholder="今何してる？"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autosize
                    minRows={3}
                    maxRows={8}
                    disabled={isSubmitting}
                    ref={textareaRef}
                />

                {/* 画像プレビュー - 複数画像対応 */}
                {imageFiles.length > 0 && (
                    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                        {imageFiles.map((image, index) => (
                            <Box key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                <ActionIcon
                                    color="red"
                                    variant="filled"
                                    radius="xl"
                                    size="sm"
                                    style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                                    onClick={() => removeImage(index)}
                                    disabled={isSubmitting || isUploading}
                                >
                                    <IconX size={16} />
                                </ActionIcon>
                                <Image
                                    src={image.preview}
                                    alt={`添付画像${index + 1}`}
                                    fit="cover"
                                    h={100}
                                    w={100}
                                    radius="sm"
                                />
                            </Box>
                        ))}
                        {imageFiles.length < MAX_IMAGES && (
                            <FileButton
                                resetRef={resetRef}
                                onChange={handleFileChange}
                                accept="image/png,image/jpeg,image/gif,image/webp"
                                disabled={isSubmitting || isUploading}
                            >
                                {(props) => (
                                    <Box
                                        {...props}
                                        style={{
                                            width: 100,
                                            height: 100,
                                            border: '2px dashed #ccc',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <IconPlus size={24} color="#ccc" />
                                    </Box>
                                )}
                            </FileButton>
                        )}
                    </Group>
                )}

                <Group justify="space-between">
                    <Group>
                        {/* 画像添付ボタン */}
                        <FileButton
                            resetRef={resetRef}
                            onChange={handleFileChange}
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            disabled={isSubmitting || isUploading || imageFiles.length >= MAX_IMAGES}
                        >
                            {(props) => (
                                <Tooltip
                                    label={imageFiles.length >= MAX_IMAGES
                                        ? `最大${MAX_IMAGES}枚まで`
                                        : "画像を添付（ドラッグ&ドロップ、クリップボードからも可能）"}
                                >
                                    <ActionIcon
                                        {...props}
                                        variant="subtle"
                                        color="gray"
                                        aria-label="画像を添付"
                                        disabled={isSubmitting || isUploading || imageFiles.length >= MAX_IMAGES}
                                    >
                                        <IconPhoto size={20} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </FileButton>

                        {/* CWトグルボタン */}
                        <Tooltip label={enableCw ? "CWを無効にする" : "CWを有効にする"}>
                            <ActionIcon
                                variant="subtle"
                                color={enableCw ? "orange" : "gray"}
                                onClick={() => setEnableCw(!enableCw)}
                                disabled={isSubmitting}
                            >
                                <IconAlertTriangle size={20} />
                            </ActionIcon>
                        </Tooltip>

                        {/* 公開範囲選択 */}
                        <Box>
                            <SegmentedControl
                                value={visibility}
                                onChange={(value) => setVisibility(value as VisibilityOption)}
                                data={[
                                    { value: 'public', label: <Tooltip label="パブリック"><IconWorld size={18} /></Tooltip> },
                                    { value: 'home', label: <Tooltip label="ホーム"><IconHome size={18} /></Tooltip> },
                                    { value: 'followers', label: <Tooltip label="フォロワー"><IconLock size={18} /></Tooltip> },
                                    { value: 'specified', label: <Tooltip label="ダイレクト"><IconMail size={18} /></Tooltip> },
                                ]}
                                disabled={isSubmitting || isUploading}
                                size="xs"
                            />
                        </Box>
                    </Group>

                    <Group>
                        {isUploading && (
                            <Group gap="xs">
                                <Loader size="xs" />
                                <Text size="xs" c="dimmed">アップロード中...</Text>
                            </Group>
                        )}

                        <Tooltip label="送信">
                            <Button
                                onClick={handleSubmit}
                                loading={isSubmitting || apiState.loading}
                                disabled={(!text.trim() && imageFiles.length === 0) || isSubmitting || isUploading}
                            >
                                <IconSend size={16} />
                            </Button>
                        </Tooltip>
                    </Group>
                </Group>

                {/* 文字数カウンターと添付画像数 */}
                <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                        {imageFiles.length > 0 ? `画像: ${imageFiles.length}/${MAX_IMAGES}` : ''}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {text.length} 文字
                    </Text>
                </Group>
            </Stack>
        </Paper>
    );
}