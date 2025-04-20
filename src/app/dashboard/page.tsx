'use client';

import { Box, Container, Grid, Modal, ActionIcon, Flex } from "@mantine/core";
import { useRef, useState, useEffect } from "react";
import MisskeyTimelineContainer from "@/components/MisskeyTimelineContainer";
import UserHeader from "@/components/UserHeader";
import { IconPencil } from '@tabler/icons-react';
import NoteComposer from "@/components/NoteComposer";
import NotificationList from "@/components/NotificationList";

export default function Dashboard() {
    const [isMobile, setIsMobile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            {isMobile ? (
                // モバイルレイアウト
                <>
                    <Box h="calc(100vh - 70px)"> {/* ヘッダーの高さ分を引く */}
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
                            bottom: 94,
                            left: 24,
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
                    <Grid.Col span="content" maw="300px">
                        <Flex h="calc(100vh - 70px)" direction="column" gap="xs">
                            <NoteComposer />
                            <Box flex={1}>
                                <NotificationList />
                            </Box>
                        </Flex>
                    </Grid.Col>
                    <Grid.Col span="auto">
                        <Box h="calc(100vh - 70px)"> {/* ヘッダーの高さ分を引く */}
                            <MisskeyTimelineContainer containerRef={containerRef} />
                        </Box>
                    </Grid.Col>
                </Grid>
            )}

            <UserHeader />
        </Container>
    );
}