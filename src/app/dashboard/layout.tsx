'use client';

import { api } from "misskey-js";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MisskeyApiClientProvider } from "../MisskeyApiClientContext";
import { Loader, Center, Text } from "@mantine/core";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [client, setClient] = useState<api.APIClient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('misskey_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // APIクライアントを初期化
        const misskeyApiClient = new api.APIClient({
            origin: 'https://virtualkemomimi.net',
            credential: token,
        });

        setClient(misskeyApiClient);
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <Center style={{ height: '100vh' }}>
                <Loader size="md" />
                <Text ml="md">ログイン情報を確認中...</Text>
            </Center>
        );
    }

    return (
        <MisskeyApiClientProvider initialClient={client}>
            {children}
        </MisskeyApiClientProvider>
    );
}