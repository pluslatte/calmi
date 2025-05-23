'use client';

import { Button, Container, Card, Text, Title, Stack, TextInput, Flex, Group, List, ThemeIcon, Divider, Anchor } from "@mantine/core";
import { useEffect, useState } from "react";
import { notifications } from '@mantine/notifications';
import { IconLogin, IconBrandGithub, IconMoon, IconFilter, IconRocket, IconCoffee, IconArrowRight } from '@tabler/icons-react';
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
        <Container size="md" py="xl">
            <Flex gap="md" direction={{ base: 'column', md: 'row' }}>
                {/* 左カラム: ログインカード */}
                <Card shadow="sm" p="lg" radius="md" withBorder style={{ flex: '1' }}>
                    <Stack align="center" gap="md">
                        <Title order={1}>calmi</Title>
                        <Text ta="center" size="sm">静かなMisskeyクライアント。</Text>
                        <Text c="dimmed" ta="left">
                            シンプルで使いやすいMisskeyクライアント。
                            必要な機能だけを残し、読みやすく。
                        </Text>

                        <TextInput
                            label="Misskeyサーバー"
                            placeholder="例：virtualkemomimi.net"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />

                        <Text c="red" ta="left" size="sm">
                            *calmi は開発のきわめて初期の段階にあり、深刻な不具合が存在する可能性が大いにあります。あなたがこのアプリを使用することで発生した問題や損害について、開発者は責任を負いません。
                        </Text>
                        <Button
                            onClick={handleLogin}
                            loading={isLoading}
                            leftSection={<IconLogin size={18} />}
                            size="md"
                            fullWidth
                        >
                            ログイン
                        </Button>
                    </Stack>
                </Card>

                {/* 右カラム: 特徴・説明 */}
                <Card shadow="sm" p="lg" radius="md" withBorder style={{ flex: '1.5' }}>
                    <Stack gap="md">
                        <Title order={3}>
                            <IconCoffee size={20} style={{ marginRight: 8 }} />
                            静かなMisskeyエクスペリエンス
                        </Title>

                        <Title order={4}>主な特徴</Title>

                        <List spacing="xs" size="sm" center>
                            <List.Item icon={
                                <ThemeIcon color="cyan" size={22} radius="xl">
                                    <IconMoon size={14} />
                                </ThemeIcon>
                            }>
                                <Text>シンプルで見やすいインターフェースで、本当に必要な情報に集中できます</Text>
                            </List.Item>
                            <List.Item icon={
                                <ThemeIcon color="cyan" size={22} radius="xl">
                                    <IconFilter size={14} />
                                </ThemeIcon>
                            }>
                                <Text>余分な機能を省いて、使いやすさと読みやすさを優先しました</Text>
                            </List.Item>
                            <List.Item icon={
                                <ThemeIcon color="cyan" size={22} radius="xl">
                                    <IconRocket size={14} />
                                </ThemeIcon>
                            }>
                                <Text>軽快な動作で、モバイル端末でも快適なMisskeyライフをサポートします</Text>
                            </List.Item>
                        </List>

                        <Divider my="sm" />

                        <Group justify="space-between">
                            <Anchor href="https://github.com/pluslatte/calmi" target="_blank" rel="noopener noreferrer">
                                <Group gap={6}>
                                    <IconBrandGithub size={16} />
                                    <Text size="sm">ソースコード</Text>
                                </Group>
                            </Anchor>
                            <Anchor href="https://github.com/pluslatte/calmi/issues" target="_blank" rel="noopener noreferrer">
                                <Group gap={6}>
                                    <IconArrowRight size={16} />
                                    <Text size="sm">バグ報告・機能要望</Text>
                                </Group>
                            </Anchor>
                        </Group>
                    </Stack>
                </Card>
            </Flex>
        </Container>
    );
}