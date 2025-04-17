// src/app/page.tsx
'use client';

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md" align="center">
        <ThemeToggle />
        <Title order={2}>Misskey クライアントへようこそ</Title>
        <Text c="dimmed">
          Mantine テーマが正しく適用されていれば、このページはスタイリングされているはずです。
        </Text>
        <Button color="cyan">サンプルボタン</Button>
      </Stack>
    </Container>
  );
}
