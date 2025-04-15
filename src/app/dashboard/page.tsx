'use client';

import { Box, Button, Container, Grid, ScrollArea, Textarea } from "@mantine/core";
import { useState } from "react";
import { useMisskeyApiClient } from "../MisskeyApiClientContext";
import MisskeyTimeline from "@/components/MisskeyTimeline";
import MisskeyTimelineContainer from "@/components/MisskeyTimelineContainer";

export default function Dashboard() {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const misskeyApiClient = useMisskeyApiClient();

    const handleCreateNote = async () => {
        setIsLoading(true);

        misskeyApiClient.request('notes/create', {
            visibility: "home",
            text: note,
        }).then((result) => {
            setIsLoading(false);
            alert("post: " + result.createdNote.text);
        });
    }

    return (
        <Container p="4">
            <Grid>
                <Grid.Col span="content">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
                    <Button onClick={handleCreateNote} loading={isLoading}>
                        ノート
                    </Button>
                </Grid.Col>
                <Grid.Col span="auto">
                    <Box h="98vh">
                        <MisskeyTimelineContainer />
                    </Box>
                </Grid.Col>
            </Grid>
        </Container>
    );
}