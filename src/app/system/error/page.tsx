'use client';

import { useSearchParams } from 'next/navigation';
import { Card, Container, Title, Text, Button, Loader } from '@mantine/core';
import Link from 'next/link';
import { Suspense } from 'react';

// https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
function ErrorContent() {
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
        <>
            <Title order={2} style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {title}
            </Title>
            <Text style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {message}
            </Text>
        </>
    );
}

function ErrorLoadingFallback() {
    return (
        <>
            <Title order={2} style={{ textAlign: 'center', marginBottom: '1rem' }}>
                認証エラー
            </Title>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <Loader size="sm" />
            </div>
        </>
    );
}

export default function AuthErrorPage() {
    return (
        <Container size="sm" style={{ marginTop: '10vh' }}>
            <Card withBorder radius="md" p="xl">
                <Suspense fallback={<ErrorLoadingFallback />}>
                    <ErrorContent />
                </Suspense>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button component={Link} href="/" variant="filled">
                        ホームに戻る
                    </Button>
                </div>
            </Card>
        </Container>
    );
}
