// src/components/NoteComposer.tsx
'use client';

import { Button, Paper, Textarea, Select, Group, Text, FileButton, Image, Stack, ActionIcon, Loader, SegmentedControl, Box, Flex, Grid, Tooltip, Switch, Collapse } from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { useUserSettingsStore, NoteVisibility } from "@/stores/useUserSettingsStore";
import { notifications } from '@mantine/notifications';
import {
    IconAlertTriangle, IconHome, IconLock, IconMail, IconPhoto, IconPlus, IconSend,
    IconUsers, IconWorld, IconX, IconFile, IconFileMusic, IconVideo
} from '@tabler/icons-react';

interface NoteComposerProps {
    onSuccess?: () => void; // 投稿成功時のコールバック
    initialQuoteNoteId?: string; // 引用リノート用のノートID
    initialReplyId?: string; // 返信用のノートID
    placeholder?: string; // プレースホルダーテキスト
}

interface FilePreview {
    file: File;
    preview: string | null; // 画像/動画のプレビューURL（ない場合はnull）
    type: 'image' | 'video' | 'audio' | 'other'; // ファイルタイプ
    name: string; // ファイル名
}

// 許可される最大ファイルサイズ（64MB）
const MAX_FILE_SIZE = 64 * 1024 * 1024;
// 添付可能な最大ファイル数
const MAX_FILES = 4;

// 許可されるファイルタイプを定義
const ALLOWED_FILE_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    // その他一般的なファイルタイプも許可
    other: ['application/pdf', 'text/plain', 'application/zip', 'application/x-zip-compressed', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export default function NoteComposer({
    onSuccess,
    initialQuoteNoteId,
    initialReplyId,
    placeholder = "今何してる？"
}: NoteComposerProps) {
    const [text, setText] = useState('');
    const [cw, setCw] = useState('');
    const [enableCw, setEnableCw] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<FilePreview[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // ユーザー設定ストアから公開範囲設定を取得
    const { defaultNoteVisibility, setDefaultNoteVisibility } = useUserSettingsStore();
    const [visibility, setVisibility] = useState<NoteVisibility>(defaultNoteVisibility);

    const resetRef = useRef<() => void>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const { createNote, createNoteWithMedia, uploadFile, apiState } = useMisskeyApiStore();

    // ファイルタイプを判別する関数
    const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'other' | null => {
        if (ALLOWED_FILE_TYPES.image.includes(mimeType)) return 'image';
        if (ALLOWED_FILE_TYPES.video.includes(mimeType)) return 'video';
        if (ALLOWED_FILE_TYPES.audio.includes(mimeType)) return 'audio';
        if (ALLOWED_FILE_TYPES.other.includes(mimeType)) return 'other';
        return null; // サポートされていない場合
    };

    // ファイル処理の共通関数
    const processFile = (file: File): Promise<FilePreview | null> => {
        return new Promise((resolve) => {
            // ファイルタイプをチェック
            const fileType = getFileType(file.type);
            if (!fileType) {
                notifications.show({
                    title: 'ファイルエラー',
                    message: 'このファイル形式はサポートされていません',
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

            // 最大数チェック
            if (uploadedFiles.length >= MAX_FILES) {
                notifications.show({
                    title: 'ファイルエラー',
                    message: `ファイルは最大${MAX_FILES}個までです`,
                    color: 'red',
                });
                resolve(null);
                return;
            }

            // 画像の場合はプレビューを作成
            if (fileType === 'image') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        resolve({
                            file,
                            preview: e.target.result as string,
                            type: fileType,
                            name: file.name
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
            } else {
                // 非画像ファイルはプレビューなしで追加
                resolve({
                    file,
                    preview: null,
                    type: fileType,
                    name: file.name
                });
            }
        });
    };

    // ファイルタイプに応じたアイコンを取得する関数
    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image': return <IconPhoto size={24} />;
            case 'video': return <IconVideo size={24} />;
            case 'audio': return <IconFileMusic size={24} />;
            default: return <IconFile size={24} />;
        }
    };

    // ファイル選択ハンドラー
    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        const preview = await processFile(file);
        if (preview) {
            setUploadedFiles([...uploadedFiles, preview]);
        }
    };

    // ファイル削除ハンドラー
    const removeFile = (index: number) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
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

        if (files.length === 0) {
            return;
        }

        // 最大数を超える場合は警告
        const remainingSlots = MAX_FILES - uploadedFiles.length;
        if (remainingSlots <= 0) {
            notifications.show({
                title: '警告',
                message: `ファイルは最大${MAX_FILES}個までです`,
                color: 'yellow',
            });
            return;
        }

        // 処理するファイル数を制限
        const filesToProcess = files.slice(0, remainingSlots);

        // 非同期で全ファイルを処理
        const previewPromises = filesToProcess.map(file => processFile(file));
        const previews = await Promise.all(previewPromises);

        // 有効なプレビューのみをフィルタリング
        const validPreviews = previews.filter((preview): preview is FilePreview => preview !== null);

        if (validPreviews.length > 0) {
            setUploadedFiles(prev => [...prev, ...validPreviews]);

            // 追加されたファイルの数に応じてメッセージを表示
            notifications.show({
                title: 'ファイル追加',
                message: `${validPreviews.length}個のファイルを追加しました`,
                color: 'green',
            });
        }
    };

    // 許可されるファイルタイプをaccept属性用に整形
    const getAcceptedFileTypes = () => {
        return [
            ...ALLOWED_FILE_TYPES.image,
            ...ALLOWED_FILE_TYPES.video,
            ...ALLOWED_FILE_TYPES.audio,
            ...ALLOWED_FILE_TYPES.other
        ].join(',');
    };

    // ファイルプレビュー表示
    const renderFilePreview = (file: FilePreview, index: number) => {
        return (
            <Box key={index} style={{ position: 'relative', display: 'inline-block' }}>
                <ActionIcon
                    color="red"
                    variant="filled"
                    radius="xl"
                    size="sm"
                    style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting || isUploading}
                >
                    <IconX size={16} />
                </ActionIcon>

                {file.type === 'image' && file.preview ? (
                    <Image
                        src={file.preview}
                        alt={file.name}
                        fit="cover"
                        h={100}
                        w={100}
                        radius="sm"
                    />
                ) : (
                    <Paper p="xs" withBorder h={100} w={100} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {getFileIcon(file.type)}
                        <Text size="xs" lineClamp={2} mt={4}>
                            {file.name}
                        </Text>
                    </Paper>
                )}
            </Box>
        );
    };

    const handleSubmit = async () => {
        // 本文もしくはファイルがある場合のみ投稿可能
        if (!text.trim() && uploadedFiles.length === 0) {
            notifications.show({
                title: '投稿エラー',
                message: 'テキストまたはファイルを入力してください',
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

            // ファイルがある場合は先にアップロード
            if (uploadedFiles.length > 0) {
                setIsUploading(true);
                try {
                    // 複数ファイルを順次アップロード
                    const uploadPromises = uploadedFiles.map(filePreview => uploadFile(filePreview.file));
                    const uploadedFileResults = await Promise.all(uploadPromises);
                    setIsUploading(false);

                    // ファイル付きノートを作成
                    await createNoteWithMedia(
                        text,
                        uploadedFileResults.map(file => file.id),
                        visibility,
                        cwText,
                        initialQuoteNoteId, // 引用リノート用のパラメータ
                        initialReplyId, // 返信用のノートID
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
                    cwText,
                    initialQuoteNoteId, // 引用リノート用のパラメータ
                    initialReplyId, // 返信用のノートID
                );
            }

            // 成功したらフォームをクリア
            setText('');
            setCw('');
            setEnableCw(false);
            setUploadedFiles([]);

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

    // キーボードショートカット（Ctrl+Enter）で送信
    useEffect(() => {
        const textareaElement = textareaRef.current;
        if (!textareaElement) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Enterで送信（Macの場合はCommandキー）
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault(); // デフォルトの改行を防止

                // 投稿可能な状態であれば実行
                if (
                    (!isSubmitting && !isUploading) &&
                    (text.trim() || uploadedFiles.length > 0) &&
                    !(enableCw && !cw.trim())
                ) {
                    handleSubmit();
                }
            }
        };

        // textareaエレメント自体にイベントリスナーを追加
        // これにより、そのtextareaにフォーカスがあるときのみイベントが発火します
        textareaElement.addEventListener('keydown', handleKeyDown);

        // クリーンアップ
        return () => {
            textareaElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [text, cw, enableCw, uploadedFiles, isSubmitting, isUploading]);

    // クリップボードからのメディアペースト処理
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (!e.clipboardData) return;

            const items = e.clipboardData.items;

            // クリップボードに画像があるかチェック
            for (let i = 0; i < items.length; i++) {
                // 画像のみペースト対応
                if (items[i].type.startsWith('image/')) {
                    // 画像データを取得
                    const file = items[i].getAsFile();
                    if (file) {
                        e.preventDefault(); // テキストエリアへのデフォルトのペーストを防止

                        if (uploadedFiles.length >= MAX_FILES) {
                            notifications.show({
                                title: 'ファイルエラー',
                                message: `ファイルは最大${MAX_FILES}個までです`,
                                color: 'red',
                            });
                            return;
                        }

                        const preview = await processFile(file);
                        if (preview) {
                            setUploadedFiles(prev => [...prev, preview]);

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
    }, [uploadedFiles]);

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
                        <Text>ファイルをドロップして添付</Text>
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
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    size="md"
                    autosize
                    minRows={3}
                    maxRows={8}
                    disabled={isSubmitting}
                    ref={textareaRef}
                />

                {/* ファイルプレビュー */}
                {uploadedFiles.length > 0 && (
                    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                        {uploadedFiles.map((file, index) => renderFilePreview(file, index))}
                        {uploadedFiles.length < MAX_FILES && (
                            <FileButton
                                resetRef={resetRef}
                                onChange={handleFileChange}
                                accept={getAcceptedFileTypes()}
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

                <Group justify="right">
                    <Group>
                        {/* ファイル添付ボタン */}
                        <FileButton
                            resetRef={resetRef}
                            onChange={handleFileChange}
                            accept={getAcceptedFileTypes()}
                            disabled={isSubmitting || isUploading || uploadedFiles.length >= MAX_FILES}
                        >
                            {(props) => (
                                <Tooltip
                                    label={uploadedFiles.length >= MAX_FILES
                                        ? `最大${MAX_FILES}個まで`
                                        : "ファイルを添付（ドラッグ&ドロップ、クリップボードからも可能）"}
                                >
                                    <ActionIcon
                                        {...props}
                                        variant="subtle"
                                        color="gray"
                                        aria-label="ファイルを添付"
                                        disabled={isSubmitting || isUploading || uploadedFiles.length >= MAX_FILES}
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
                                onChange={(value) => {
                                    const newVisibility = value as NoteVisibility;
                                    setVisibility(newVisibility);
                                    // 設定を保存
                                    setDefaultNoteVisibility(newVisibility);
                                }}
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

                        <Tooltip label="送信（Ctrl+Enter）">
                            <Button
                                onClick={handleSubmit}
                                loading={isSubmitting || apiState.loading}
                                disabled={(!text.trim() && uploadedFiles.length === 0) || isSubmitting || isUploading}
                            >
                                <IconSend size={16} />
                            </Button>
                        </Tooltip>
                    </Group>
                </Group>

                {/* 文字数カウンターと添付ファイル数 */}
                <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                        {uploadedFiles.length > 0 ? `ファイル: ${uploadedFiles.length}/${MAX_FILES}` : ''}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {text.length} 文字
                    </Text>
                </Group>
            </Stack>
        </Paper>
    );
}