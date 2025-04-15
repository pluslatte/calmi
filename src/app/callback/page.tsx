'use client';

import { MisskeyService } from "@/services/MisskeyService";
import { Container, Center, Loader, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Callback() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const session = new URLSearchParams(window.location.search).get('session');

        if (!session) {
            setError('セッションが見つかりません');
            return;
        }

        const authenticateUser = async () => {
            try {
                const token = await MisskeyService.authenticateWithSession(
                    session,
                    'https://virtualkemomimi.net'
                );

                if (!token) {
                    setError('認証に失敗しました');
                    return;
                }

                localStorage.setItem('misskey_token', token);
                router.push('/dashboard');
            } catch (error) {
                console.error('Authentication error:', error);
                setError('認証処理中にエラーが発生しました');
            }
        };

        authenticateUser();
    }, [router]);

    if (error) {
        return (
            <Container mt="xl">
                <Center>
                    <Text c="red">{error}</Text>
                </Center>
            </Container>
        );
    }

    return (
        <Container mt="xl">
            <Center>
                <Loader size="xl" />
                <Text ml="md">認証処理中...</Text>
            </Center>
        </Container>
    );
}