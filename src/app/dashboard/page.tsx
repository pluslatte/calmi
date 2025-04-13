'use client';

import { Button, Textarea } from "@mantine/core";
import { APIClient } from "misskey-js/api.js";
import { useState } from "react";

export default function Dashboard() {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateNote = async () => {
        const token = localStorage.getItem('misskey_token');

        if (!token) {
            alert('you are not logged-in');
            return;
        }

        setIsLoading(true);

        const misskeyApiClient = new APIClient({
            origin: 'https://virtualkemomimi.net',
            credential: token,
        });

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