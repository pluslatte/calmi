'use client';

import { Box, Button, Container, Grid, Textarea } from "@mantine/core";
import { useRef, useState } from "react";
import MisskeyTimelineContainer from "@/components/MisskeyTimelineContainer";
import { MisskeyService } from "@/services/MisskeyService";
import { useMisskeyService } from "@/contexts/MisskeyContext";

export default function Dashboard() {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    const { service } = useMisskeyService();

    if (!service) return;

    const handleCreateNote = async () => {
        setIsLoading(true);

        try {
            const result = await service.createNote(note)
            alert("post: " + result.createdNote.text);
        } catch (error) {
            console.error("Failed to create note:", error);
            alert("投稿に失敗しました");
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
                        placeholder="何か書いてみましょう..."
                        minRows={3}
                        mb="xs"
                    />
                    <Button
                        onClick={handleCreateNote}
                        loading={isLoading}
                        disabled={!note.trim()}
                    >
                        ノート
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