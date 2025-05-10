'use client';

import { Box, Container, Grid, Flex } from "@mantine/core";
import { useRef, useState, useEffect } from "react";
import MisskeyTimelineContainer from "@/components/timeline/MisskeyTimelineContainer";
import NoteComposer from "@/components/NoteComposer";
import NotificationList from "@/components/notifications/NotificationList";

export default function Dashboard() {
    const [isMobile, setIsMobile] = useState(false);
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

    return (
        <Container p="4" ref={containerRef} style={{ position: 'relative' }}>
            {isMobile ? (
                // モバイルレイアウト
                <>
                    <Box h="calc(100vh - 70px)"> {/* ヘッダーの高さ分を引く */}
                        <MisskeyTimelineContainer containerRef={containerRef} />
                    </Box>
                </>
            ) : (
                // デスクトップレイアウト
                <Grid>
                    <Grid.Col span="content" maw="300px">
                        <Flex h="calc(100vh - 70px)" direction="column" gap="xs">
                            <NoteComposer />
                            <Box style={{ flex: 1, overflow: 'hidden' }}>
                                <NotificationList />
                            </Box>
                        </Flex>
                    </Grid.Col>
                    <Grid.Col span="auto">
                        <Box h="calc(100vh - 70px)"> {/* フッターの高さ分を引く */}
                            <MisskeyTimelineContainer containerRef={containerRef} />
                        </Box>
                    </Grid.Col>
                </Grid>
            )}
        </Container>
    );
}