'use client';

import { Box, Button, Container, Grid, Textarea, Modal, ActionIcon } from "@mantine/core";
import { useRef, useState, useEffect } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import MisskeyTimelineContainer from "@/components/MisskeyTimelineContainer";
import UserHeader from "@/components/UserHeader";
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPencil } from '@tabler/icons-react';
import NoteComposer from "@/components/NoteComposer";

export default function Dashboard() {
    const [note, setNote] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { createNote, apiState } = useMisskeyApiStore();
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
            // エラーハンドリングはストア内で処理済み
            console.error('Failed to create note:', error);
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
            <NoteComposer onSuccess={() => setIsModalOpen(false)} />
        </Modal>
    );

    return (
        <Container p="4" ref={containerRef} style={{ position: 'relative' }}>
            <UserHeader />

            {isMobile ? (
                // モバイルレイアウト
                <>
                    <Box h="calc(98vh - 70px)"> {/* ヘッダーの高さ分を引く */}
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
                // デスクトップレイアウト
                <Grid>
                    <Grid.Col span="content">
                        <NoteComposer />
                    </Grid.Col>
                    <Grid.Col span="auto">
                        <Box h="calc(98vh - 70px)"> {/* ヘッダーの高さ分を引く */}
                            <MisskeyTimelineContainer containerRef={containerRef} />
                        </Box>
                    </Grid.Col>
                </Grid>
            )}
        </Container>
    );
}