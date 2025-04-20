'use client';

import { api } from "misskey-js";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MisskeyApiProvider } from "../MisskeyApiProvider";
import { Loader, Center, Text, Stack, Button, Box } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { EmojiCacheProvider } from "@/lib/emoji/EmojiCacheProvider";
import UserFooter from "@/components/UserFooter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [client, setClient] = useState<api.APIClient | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('misskey_token');
                const serverUrl = localStorage.getItem('misskey_server') || 'https://virtualkemomimi.net';

                if (!token) {
                    setAuthError('ログインが必要です');
                    setLoading(false);
                    return;
                }

                // APIクライアントを初期化
                const misskeyApiClient = new api.APIClient({
                    origin: serverUrl,
                    credential: token,
                });

                // APIで認証状態を確認
                try {
                    // 自分の情報を取得してみる（トークンが有効か確認）
                    await misskeyApiClient.request('i', {});
                } catch (error) {
                    console.error('API authentication error:', error);
                    // APIエラーが発生した場合はトークンが無効の可能性
                    localStorage.removeItem('misskey_token');
                    setAuthError('認証情報が無効です。再度ログインしてください');
                    setLoading(false);
                    return;
                }

                setClient(misskeyApiClient);
                setLoading(false);
            } catch (error) {
                console.error('Authentication check error:', error);
                setAuthError('認証チェック中にエラーが発生しました');
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center" gap="md">
                    <Loader size="md" />
                    <Text>ログイン情報を確認中...</Text>
                </Stack>
            </Center>
        );
    }

    if (authError) {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center" gap="lg">
                    <Text c="red">{authError}</Text>
                    <Button
                        leftSection={<IconLogin size={18} />}
                        onClick={() => router.push('/login')}
                    >
                        ログインページへ
                    </Button>
                </Stack>
            </Center>
        );
    }

    return (
        <MisskeyApiProvider initialClient={client}>
            <EmojiCacheProvider>
                {children}
                <UserFooter />
            </EmojiCacheProvider>
        </MisskeyApiProvider>
    );
}