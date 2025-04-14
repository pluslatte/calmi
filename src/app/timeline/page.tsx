'use client';

import { useEffect, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useMisskeyApiClient } from "../MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Container } from "@mantine/core";

export default function Timeline() {
    const [notes, setNotes] = useState<Note[]>([]);
    const misskeyApiClient = useMisskeyApiClient();

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
                <div key={note.id}>
                    <MisskeyNote note={note} />
                </div>
            ))}
        </Container>
    );
}
