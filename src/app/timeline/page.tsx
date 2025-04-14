'use client';

import { useEffect, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useMisskeyApiClient } from "../MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { ActionIcon, Box, Container, Divider, Grid, Group, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { IconArrowBackUp, IconDots, IconHeart, IconMessageReply, IconMoodSmile, IconRepeat } from "@tabler/icons-react";

export default function Timeline() {
    const [notes, setNotes] = useState<Note[]>([]);
    const misskeyApiClient = useMisskeyApiClient();
    const { colorScheme } = useMantineColorScheme();

    useEffect(() => {
        const timeline = new TimelineFeed('global', misskeyApiClient);

        const callback = () => {
            console.log('callback');
            setNotes(timeline.notes.value);
            console.log(notes.length);
        }

        timeline.notes.subscribe(callback);
        timeline.initFeed();

        return () => {
            timeline.notes.unsubscribe(callback);
            timeline.stream?.close();
        };
    }, []);

    return (
        <Container>
            {notes.map(note => (
                <Box key={note.id}>
                    <MisskeyNote note={note} />
                    <Group gap="xl">
                        <Box w="32px" />
                        <ActionIcon variant="subtle" aria-label="reply" color={colorScheme === 'dark' ? 'white' : 'black'}>
                            <IconArrowBackUp size="70%" />
                        </ActionIcon>
                        <ActionIcon variant="subtle" aria-label="renote" color={colorScheme === 'dark' ? 'white' : 'black'}>
                            <IconRepeat size="70%" />
                        </ActionIcon>
                        <ActionIcon variant="subtle" aria-label="reaction" color={colorScheme === 'dark' ? 'white' : 'black'}>
                            <IconHeart size="70%" />
                        </ActionIcon>
                        <ActionIcon variant="subtle" aria-label="other" color={colorScheme === 'dark' ? 'white' : 'black'}>
                            <IconDots size="70%" />
                        </ActionIcon>
                    </Group>
                    <Divider my="sm" />
                </Box>
            ))}
        </Container>
    );
}
