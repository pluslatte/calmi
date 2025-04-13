'use client';

import { useEffect, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useApiClient } from "../MisskeyApiClientContext";

export default function Timeline() {
    const [notes, setNotes] = useState<Note[]>([]);
    const misskeyApiClient = useApiClient();

    useEffect(() => {
        const timeline = new TimelineFeed('global', misskeyApiClient, () => { console.log('callback'); setNotes(timeline.notes); console.log(notes.length); });

        timeline.initFeed();

        return () => {
            timeline.stream?.close();
        };
    }, []);

    return (
        <div>
            {notes.map(note => (
                <div key={note.id}>
                    <p>{note.user.name}</p>
                    <p>{note.text}</p>
                </div>
            ))}
        </div>
    );
}
