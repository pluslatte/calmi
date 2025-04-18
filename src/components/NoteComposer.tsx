// src/components/NoteComposer.tsx
'use client';

import { Button, Paper, Textarea, Select, Group, Text, FileButton, Image, Stack, ActionIcon, Loader } from "@mantine/core";
import { useState, useRef } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { notifications } from '@mantine/notifications';
import { IconPhoto, IconX } from '@tabler/icons-react';

type VisibilityOption = 'public' | 'home' | 'followers' | 'specified';

interface NoteComposerProps {
    onSuccess?: () => void; // 投稿成功時のコールバック
}

export default function NoteComposer({ onSuccess }: NoteComposerProps) {
    const [text, setText] = useState('');
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
        if (!text.trim() && !imageFile) {
            notifications.show({
                title: '投稿エラー',
                message: 'テキストまたは画像を入力してください',
                color: 'red',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let createdNote;

            // 画像がある場合は先にアップロード
            if (imageFile) {
                setIsUploading(true);
                try {
                    const uploadedFile = await uploadFile(imageFile);
                    setIsUploading(false);

                    // 画像付きノートを作成
                    createdNote = await createNoteWithMedia(text, [uploadedFile.id], visibility);
                } catch (error) {
                    setIsUploading(false);
                    throw error; // エラー処理を統一
                }
            } else {
                // テキストのみのノートを作成
                createdNote = await createNote(text, visibility);
            }

            // 成功したらフォームをクリア
            setText('');
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

                        <Select
                            value={visibility}
                            onChange={(value) => setVisibility(value as VisibilityOption)}
                            data={[
                                { value: 'public', label: '公開' },
                                { value: 'home', label: 'ホーム' },
                                { value: 'followers', label: 'フォロワー' },
                                { value: 'specified', label: 'ダイレクト' },
                            ]}
                            disabled={isSubmitting || isUploading}
                            size="xs"
                            w={120}
                        />
                    </Group>

                    <Group>
                        {isUploading && (
                            <Group gap="xs">
                                <Loader size="xs" />
                                <Text size="xs" c="dimmed">アップロード中...</Text>
                            </Group>
                        )}

                        <Button
                            onClick={handleSubmit}
                            loading={isSubmitting || apiState.loading}
                            disabled={(!text.trim() && !imageFile) || isSubmitting || isUploading}
                        >
                            ノートする
                        </Button>
                    </Group>
                </Group>

                {/* 文字数カウンター */}
                <Text size="xs" c="dimmed" ta="right">
                    {text.length}/3000
                </Text>
            </Stack>
        </Paper>
    );
}