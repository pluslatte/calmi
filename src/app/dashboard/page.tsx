'use client';

import { Box, Button, Container, Grid, Textarea } from "@mantine/core";
import { useRef, useState } from "react";
import { useMisskeyApiClient } from "../MisskeyApiClientContext";
import MisskeyTimelineContainer from "@/components/MisskeyTimelineContainer";
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';

export default function Dashboard() {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { createNote, apiState } = useMisskeyApiClient();
    const containerRef = useRef(null);

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

    return (
        <Container p="4" ref={containerRef}>
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
        </Container>
    );
}