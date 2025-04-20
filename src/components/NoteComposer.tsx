// src/components/NoteComposer.tsx
'use client';

import { Button, Paper, Textarea, Select, Group, Text, FileButton, Image, Stack, ActionIcon, Loader, SegmentedControl, Box, Flex, Grid, Tooltip, Switch, Collapse } from "@mantine/core";
import { useState, useRef } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconHome, IconLock, IconMail, IconPhoto, IconSend, IconUsers, IconWorld, IconX } from '@tabler/icons-react';

type VisibilityOption = 'public' | 'home' | 'followers' | 'specified';

interface NoteComposerProps {
    onSuccess?: () => void; // 投稿成功時のコールバック
}

export default function NoteComposer({ onSuccess }: NoteComposerProps) {
    const [text, setText] = useState('');
    const [cw, setCw] = useState('');
    const [enableCw, setEnableCw] = useState(false);
    const [visibility, setVisibility] = useState<VisibilityOption>('home');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const resetRef = useRef<() => void>(null);

    const { createNote, createNoteWithMedia, uploadFile, apiState } = useMisskeyApiStore();

    const handleFileChange = (file: File | null) => {
        if (file) {
            // ファイルサイズチェック (8MB)
            if (file.size > 8 * 1024 * 1024) {
                notifications.show({
                    title: 'ファイルエラー',
                    message: 'ファイルサイズは8MB以下にしてください',
                    color: 'red',
                });
                return;
            }

            setImageFile(file);
            // プレビューを作成
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (resetRef.current) {
            resetRef.current();
        }
    };

    const handleSubmit = async () => {
        // 本文もしくは画像がある場合のみ投稿可能
        if (!text.trim() && !imageFile) {
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
            let createdNote;
            const cwText = enableCw ? cw : null;

            // 画像がある場合は先にアップロード
            if (imageFile) {
                setIsUploading(true);
                try {
                    const uploadedFile = await uploadFile(imageFile);
                    setIsUploading(false);

                    // 画像付きノートを作成
                    createdNote = await createNoteWithMedia(
                        text,
                        [uploadedFile.id],
                        visibility,
                        cwText
                    );
                } catch (error) {
                    setIsUploading(false);
                    throw error; // エラー処理を統一
                }
            } else {
                // テキストのみのノートを作成
                createdNote = await createNote(
                    text,
                    visibility,
                    cwText
                );
            }

            // 成功したらフォームをクリア
            setText('');
            setCw('');
            setEnableCw(false);
            clearImage();

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
        <Paper p="md" withBorder>
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
                />

                {/* 画像プレビュー */}
                {imagePreview && (
                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                        <ActionIcon
                            color="red"
                            variant="filled"
                            radius="xl"
                            size="sm"
                            style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                            onClick={clearImage}
                            disabled={isSubmitting || isUploading}
                        >
                            <IconX size={16} />
                        </ActionIcon>
                        <Image
                            src={imagePreview}
                            alt="添付画像プレビュー"
                            fit="contain"
                            h={200}
                            radius="sm"
                        />
                    </div>
                )}

                <Group justify="space-between">
                    <Group>
                        {/* 画像添付ボタン */}
                        <FileButton
                            resetRef={resetRef}
                            onChange={handleFileChange}
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            disabled={isSubmitting || isUploading}
                        >
                            {(props) => (
                                <ActionIcon
                                    {...props}
                                    variant="subtle"
                                    color="gray"
                                    aria-label="画像を添付"
                                    disabled={isSubmitting || isUploading || !!imageFile}
                                >
                                    <IconPhoto size={20} />
                                </ActionIcon>
                            )}
                        </FileButton>

                        {/* CWトグルボタン - 他のアイコンと統合 */}
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
                                disabled={(!text.trim() && !imageFile) || isSubmitting || isUploading}
                            >
                                <IconSend size={16} />
                            </Button>
                        </Tooltip>
                    </Group>
                </Group>

                {/* 文字数カウンター */}
                <Text size="xs" c="dimmed" ta="right">
                    {text.length} 文字
                </Text>
            </Stack>
        </Paper>
    );
}