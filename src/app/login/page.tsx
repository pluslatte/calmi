'use client';

import { Button, Container, Title, Text, Center, Paper } from "@mantine/core";
import { useState } from "react";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        const sessionId = crypto.randomUUID();
        const misskeyHost = 'https://virtualkemomimi.net';
        const appName = 'calmi';
        const callbackUrl = 'http://localhost:3000/callback';
        const permissions = 'read:account,write:notes,read:channels,read:notifications,write:reactions';

        const authUrl = `${misskeyHost}/miauth/${sessionId}?name=${appName}&callback=${callbackUrl}&permission=${permissions}`;
        window.location.href = authUrl;
    };

    return (
        <Container size="xs" mt="xl">
            <Paper p="xl" radius="md" withBorder>
                <Center>
                    <Title order={2} mb="lg">calmi にログイン</Title>
                </Center>
                <Text mb="xl">
                    Misskey アカウントでログインして、静かなタイムラインを楽しみましょう。
                </Text>
                <Button
                    fullWidth
                    onClick={handleLogin}
                    loading={isLoading}
                >
                    Misskey でログイン
                </Button>
            </Paper>
        </Container>
    );
}