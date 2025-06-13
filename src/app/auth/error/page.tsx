'use client';

import { useSearchParams } from 'next/navigation';
import { Card, Container, Title, Text, Button } from '@mantine/core';
import Link from 'next/link';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'AccessDenied':
                return {
                    title: 'アクセスが拒否されました',
                    message: 'このアプリケーションの使用が許可されていないアカウントです。管理者にお問い合わせください。',
                };
            case 'OAuthSignin':
            case 'OAuthCallback':
                return {
                    title: 'GitHub認証エラー',
                    message: 'GitHub認証中にエラーが発生しました。もう一度お試しください。',
                };
            default:
                return {
                    title: '認証エラー',
                    message: '認証中にエラーが発生しました。もう一度お試しください。',
                };
        }
    };

    const { title, message } = getErrorMessage(error);

    return (
        <Container size="sm" style={{ marginTop: '10vh' }}>
            <Card withBorder radius="md" p="xl">
                <Title order={2} style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    {title}
                </Title>
                <Text style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {message}
                </Text>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button component={Link} href="/" variant="filled">
                        ホームに戻る
                    </Button>
                </div>
            </Card>
        </Container>
    );
}
