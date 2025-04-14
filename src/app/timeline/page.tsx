'use client';

import { useEffect, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useApiClient } from "../MisskeyApiClientContext";

export default function Timeline() {
    const [notes, setNotes] = useState<Note[]>([]);
    const misskeyApiClient = useApiClient();

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
