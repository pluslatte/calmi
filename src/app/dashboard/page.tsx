'use client';

import { Button, Textarea } from "@mantine/core";
import { useState } from "react";
import { useApiClient } from "../MisskeyApiClientContext";

export default function Dashboard() {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const misskeyApiClient = useApiClient();

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
        <div>
            <h1>Dashboard</h1>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <Button onClick={handleCreateNote} loading={isLoading}>
                Note
            </Button>
        </div>
    )
}