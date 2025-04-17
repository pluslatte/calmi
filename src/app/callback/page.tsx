'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "misskey-js";
import { Container, Card, Text, Center, Loader, Stack } from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export default function Callback() {
    const router = useRouter();
    const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const verifyAndGetToken = async () => {
            try {
                // URLからセッションIDを取得
                const sessionParam = new URLSearchParams(window.location.search).get('session');
                if (!sessionParam) {
                    throw new Error('セッションIDが見つかりません');
                }

                // ローカルストレージから元のセッションIDを取得して検証
                const storedSessionId = localStorage.getItem('misskey_session_id');
                if (storedSessionId !== sessionParam) {
                    throw new Error('セッションIDが一致しません');
                }

                // MiAuth認証を検証
                const res = await fetch(`https://virtualkemomimi.net/api/miauth/${sessionParam}/check`, {
                    method: 'POST',
                });

                if (!res.ok) {
                    throw new Error(`認証エラー: ${res.status} ${res.statusText}`);
                }

                const data: { token: string; user: any } = await res.json();

                if (!data.token) {
                    throw new Error('トークンが取得できませんでした');
                }

                // トークンを保存
                localStorage.setItem('misskey_token', data.token);

                // 通知を更新
                notifications.update({
                    id: 'login-notification',
                    title: 'ログイン成功',
                    message: 'Misskeyへのログインに成功しました',
                    color: 'green',
                    icon: <IconCheck />,
                    autoClose: 3000,
                    loading: false
                });

                setStatus('success');

                // リダイレクト準備（成功通知を見せるために少し遅延）
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);

            } catch (error: any) {
                setStatus('error');
                setErrorMessage(error.message || '認証処理中にエラーが発生しました');

                notifications.show({
                    title: 'ログインエラー',
                    message: error.message || '認証処理中にエラーが発生しました',
                    color: 'red',
                    icon: <IconX />,
                    autoClose: 5000
                });

                console.error('Authentication error:', error);

                // ログイン画面に戻るための準備
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } finally {
                // セッションIDをクリア
                localStorage.removeItem('misskey_session_id');
            }
        };

        verifyAndGetToken();
    }, [router]);

    return (
        <Container size="xs" py="xl">
            <Card shadow="sm" p="lg" radius="md" withBorder>
                <Stack align="center" gap="md" py="xl">
                    {status === 'checking' && (
                        <>
                            <Loader size="md" />
                            <Text>認証処理中です...</Text>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <IconCheck size={24} color="green" />
                            <Text c="green">ログインに成功しました！</Text>
                            <Text size="sm" c="dimmed">ダッシュボードにリダイレクトします...</Text>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <IconX size={24} color="red" />
                            <Text c="red">ログインに失敗しました</Text>
                            <Text size="sm" c="dimmed">{errorMessage}</Text>
                            <Text mt="md" size="sm">ログイン画面に戻ります...</Text>
                        </>
                    )}
                </Stack>
            </Card>
        </Container>
    );
}