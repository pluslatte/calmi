'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Stack, Text, Title, Button, Center, Loader } from '@mantine/core';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('misskey_token');

    if (token) {
      // ログイン済みの場合はダッシュボードへリダイレクト
      router.push('/dashboard');
    } else {
      // 未ログインの場合はログインページへリダイレクト
      router.push('/login');
    }
  }, [router]);

  // リダイレクト中のローディング表示
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg" align="center" justify="center" style={{ minHeight: '70vh' }}>
        <ThemeToggle />
        <Title order={2}>calmi</Title>
        <Text c="dimmed" ta="center">
          静かに Misskey を使いたい人のためのクライアント
        </Text>
        <Center>
          <Loader size="md" />
        </Center>
        <Text size="sm" c="dimmed">リダイレクト中...</Text>
      </Stack>
    </Container>
  );
}