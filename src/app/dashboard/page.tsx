'use client';

import { Box, Button, Container, Grid, Textarea, Modal, ActionIcon } from "@mantine/core";
import { useRef, useState, useEffect } from "react";
import { useMisskeyApiClient } from "../MisskeyApiClientContext";
import MisskeyTimelineContainer from "@/components/MisskeyTimelineContainer";
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPencil } from '@tabler/icons-react';

export default function Dashboard() {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { createNote, apiState } = useMisskeyApiClient();
    const containerRef = useRef(null);

    // レスポンシブデザイン用のウィンドウサイズ監視
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // 初期チェック
        checkIfMobile();

        // リサイズイベントリスナー設定
        window.addEventListener('resize', checkIfMobile);

        // クリーンアップ
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const handleCreateNote = async () => {
        if (!note.trim()) {
            notifications.show({
                title: '投稿エラー',
                message: 'ノートの内容を入力してください',
                color: 'red',
            });
            return;
        }

        try {
            setIsLoading(true);
            const result = await createNote(note);

            setNote('');
            if (isMobile) setIsModalOpen(false);

            notifications.show({
                title: '投稿成功',
                message: 'ノートを投稿しました',
                color: 'green',
                icon: <IconCheck />,
                autoClose: 3000
            });
        } catch (error) {
            // エラーハンドリングはコンテキスト内で処理済み
            console.error('Failed to create note:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // モバイル用投稿モーダル
    const renderMobileNoteModal = () => (
        <Modal
            opened={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="ノートを投稿"
            centered
            size="lg"
            zIndex={1000}
        >
            <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="今何してる？"
                autosize
                minRows={3}
                maxRows={10}
            />
            <Button
                onClick={handleCreateNote}
                loading={isLoading || apiState.loading}
                mt="xs"
                fullWidth
            >
                ノートを投稿
            </Button>
        </Modal>
    );

    return (
        <Container p="4" ref={containerRef} style={{ position: 'relative' }}>
            {isMobile ? (
                // モバイルレイアウト
                <>
                    <Box h="98vh">
                        <MisskeyTimelineContainer containerRef={containerRef} />
                    </Box>

                    {/* フローティングアクションボタン */}
                    <ActionIcon
                        color="cyan"
                        variant="filled"
                        radius="xl"
                        size="xl"
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 900,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <IconPencil size={24} />
                    </ActionIcon>

                    {/* モバイル用投稿モーダル */}
                    {renderMobileNoteModal()}
                </>
            ) : (
                // デスクトップレイアウト (既存の実装を維持)
                <Grid>
                    <Grid.Col span="content">
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="今何してる？"
                            autosize
                            minRows={3}
                            maxRows={10}
                        />
                        <Button
                            onClick={handleCreateNote}
                            loading={isLoading || apiState.loading}
                            mt="xs"
                            fullWidth
                        >
                            ノートを投稿
                        </Button>
                    </Grid.Col>
                    <Grid.Col span="auto">
                        <Box h="98vh">
                            <MisskeyTimelineContainer containerRef={containerRef} />
                        </Box>
                    </Grid.Col>
                </Grid>
            )}
        </Container>
    );
}