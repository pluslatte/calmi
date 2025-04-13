'use client';

import { Button } from "@mantine/core";
import { useState } from "react";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);

        const sessionId = crypto.randomUUID();

        const misskeyHost = 'https://virtualkemomimi.net';
        const appName = 'calmi';
        const callbackUrl = 'http://localhost:3000/callback';
        const permissions = 'read:notes,write:notes';

        const authUrl = `${misskeyHost}/miauth/${sessionId}?name=${appName}&callback=${callbackUrl}&permission=${permissions}`;

        window.location.href = authUrl;
    }

    return (
        <div>
            <h1>Login</h1>
            <Button onClick={handleLogin} loading={isLoading}>
                Login
            </Button>
        </div>
    )
}