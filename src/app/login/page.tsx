'use client';

import { Button, Container, Card, Text, Title, Group, Stack } from "@mantine/core";
import { useState } from "react";
import { notifications } from '@mantine/notifications';
import { IconLogin } from '@tabler/icons-react';

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLoading(true);

            const sessionId = crypto.randomUUID();

            const misskeyHost = 'https://virtualkemomimi.net';
            const appName = 'calmi';
            const callbackUrl = process.env.NODE_ENV === 'production'
                ? `${window.location.origin}/callback`
                : 'http://localhost:3000/callback';
            const permissions = 'read:account,write:notes,read:channels,read:notifications,write:reactions';

            // セッションIDをローカルストレージに保存（コールバック後に検証するため）
            localStorage.setItem('misskey_session_id', sessionId);

            const authUrl = `${misskeyHost}/miauth/${sessionId}?name=${appName}&callback=${callbackUrl}&permission=${permissions}`;

            // ログイン試行を通知
            notifications.show({
                title: 'Misskeyにログインしています',
                message: 'ブラウザで認証画面を開きます',
                color: 'blue',
                loading: true,
                autoClose: false,
                id: 'login-notification'
            });

            window.location.href = authUrl;
        } catch (error) {
            setIsLoading(false);
            notifications.show({
                title: 'ログインエラー',
                message: '認証プロセスの開始に失敗しました',
                color: 'red',
                autoClose: 5000
            });
            console.error('Login error:', error);
        }
    }

    return (
        <Container size="xs" py="xl">
            <Card shadow="sm" p="lg" radius="md" withBorder>
                <Stack align="center" gap="md">
                    <Title order={2}>Misskeyにログイン</Title>
                    <Text c="dimmed" size="sm" ta="center">
                        Misskeyのアカウントでログインして、静かなMisskeyクライアントを使い始めましょう
                    </Text>

                    <Button
                        onClick={handleLogin}
                        loading={isLoading}
                        leftSection={<IconLogin size={18} />}
                        size="md"
                    >
                        ログイン
                    </Button>
                </Stack>
            </Card>
        </Container>
    );
}