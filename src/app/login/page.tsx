'use client';

import { Button, Container, Card, Text, Title, Stack, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { notifications } from '@mantine/notifications';
import { IconLogin } from '@tabler/icons-react';
import { useRouter } from "next/navigation";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [serverUrl, setServerUrl] = useState('https://virtualkemomimi.net');
    const router = useRouter();

    // マウント時にローカルストレージからサーバーURLを取得
    useEffect(() => {
        const token = localStorage.getItem('misskey_token');
        const savedServer = localStorage.getItem('misskey_server');

        if (savedServer) {
            setServerUrl(savedServer);
        }

        if (token) {
            // トークンが存在する場合はダッシュボードへリダイレクト
            router.push('/dashboard');
        } else {
            // チェック完了
            setIsCheckingAuth(false);
        }
    }, [router]);

    const handleLogin = async () => {
        try {
            setIsLoading(true);

            // サーバーURLの検証
            if (!serverUrl.trim()) {
                notifications.show({
                    title: '入力エラー',
                    message: 'Misskeyサーバーのアドレスを入力してください',
                    color: 'red',
                    autoClose: 5000
                });
                setIsLoading(false);
                return;
            }

            // サーバーURLの正規化
            let normalizedUrl = serverUrl.trim();
            if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
                normalizedUrl = 'https://' + normalizedUrl;
            }

            // 末尾のスラッシュを削除
            if (normalizedUrl.endsWith('/')) {
                normalizedUrl = normalizedUrl.slice(0, -1);
            }

            // サーバーURLをローカルストレージに保存
            localStorage.setItem('misskey_server', normalizedUrl);

            const sessionId = crypto.randomUUID();

            const callbackUrl = process.env.NODE_ENV === 'production'
                ? `${window.location.origin}/callback`
                : 'http://localhost:3000/callback';
            const permissions = 'read:account,write:notes,read:channels,read:notifications,write:reactions,read:drive,write:drive';

            // セッションIDをローカルストレージに保存（コールバック後に検証するため）
            localStorage.setItem('misskey_session_id', sessionId);

            const authUrl = `${normalizedUrl}/miauth/${sessionId}?name=calmi&callback=${callbackUrl}&permission=${permissions}`;

            // ログイン試行を通知
            notifications.show({
                title: 'Misskeyにログインしています',
                message: 'ブラウザで認証画面を開きます',
                color: 'cyan',
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

    // 認証チェック中はローディング表示
    if (isCheckingAuth) {
        return (
            <Container size="xs" py="xl">
                <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Stack align="center" gap="md">
                        <Title order={2}>認証状態を確認中...</Title>
                        <Text c="dimmed" size="sm" ta="center">
                            しばらくお待ちください
                        </Text>
                    </Stack>
                </Card>
            </Container>
        );
    }

    return (
        <Container size="xs" py="xl">
            <Card shadow="sm" p="lg" radius="md" withBorder>
                <Stack align="center" gap="md">
                    <Title order={1}>calmi</Title>
                    <Text c="dimmed" ta="center">
                        静かに Misskey を使いたい人のためのクライアント
                    </Text>

                    <TextInput
                        label="Misskeyサーバー"
                        placeholder="例：virtualkemomimi.net"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />

                    <Button
                        onClick={handleLogin}
                        loading={isLoading}
                        leftSection={<IconLogin size={18} />}
                        size="md"
                    >
                        ログイン
                    </Button>
                    <Text c="dimmed" size="sm" ta="center">
                        Misskeyのアカウントでログインして、静かなMisskeyクライアントを使い始めましょう
                    </Text>
                </Stack>
            </Card>
        </Container>
    );
}