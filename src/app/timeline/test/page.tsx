'use client';

import MisskeyNote from "@/components/MisskeyNote";
import { useMisskeyApiClient } from "../../MisskeyApiClientContext";
import { useEffect, useState } from "react";
import { Note } from "misskey-js/entities.js";

export default function Test() {
    const misskeyApiClient = useMisskeyApiClient();

    const [note, setNote] = useState<Note>();

    useEffect(() => {
        misskeyApiClient.request('notes/show', {
            noteId: 'a6helkshsr'
        }).then((note) => { setNote(note) });
    }, [])

    return (
        note ? <MisskeyNote note={note} /> : <p>Loading...</p>
    )
}