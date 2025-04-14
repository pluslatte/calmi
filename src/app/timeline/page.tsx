'use client';

import React, { useEffect, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useMisskeyApiClient } from "../MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Container, Divider } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";

export default function Timeline() {
    const [notes, setNotes] = useState<Note[]>([]);
    const misskeyApiClient = useMisskeyApiClient();

    useEffect(() => {
        const timeline = new TimelineFeed('global', misskeyApiClient);

        const callback = () => {
            setNotes(timeline.notes.value);
        }

        timeline.notes.subscribe(callback);
        timeline.initFeed();

        return () => {
            timeline.notes.unsubscribe(callback);
            timeline.stream?.close();
        };
    }, []);

    return (
        <React.Fragment>
            {notes.map(note => (
                <Box key={note.id}>
                    <MisskeyNote note={note} />
                    <MisskeyNoteActions />
                    <Divider my="sm" />
                </Box>
            ))}
        </React.Fragment>
    );
}
