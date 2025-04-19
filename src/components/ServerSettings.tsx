// src/components/ServerSettings.tsx
import { useState } from 'react';
import { Button, TextInput, Paper, Title, Box, Text, Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconServer, IconAlertCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ServerSettings() {
    const [serverUrl, setServerUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('misskey_server') || 'https://virtualkemomimi.net';
        }
        return 'https://virtualkemomimi.net';
    });

    const [isChanging, setIsChanging] = useState(false);
    const router = useRouter();

    const handleServerChange = () => {
        try {
            // サーバーURLの検証
            if (!serverUrl.trim()) {
                notifications.show({
                    title: '入力エラー',
                    message: 'Misskeyサーバーのアドレスを入力してください',
                    color: 'red',
                });
                return;
            }

            // URLの正規化
            let normalizedUrl = serverUrl.trim();
            if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
                normalizedUrl = 'https://' + normalizedUrl;
            }

            // 末尾のスラッシュを削除
            if (normalizedUrl.endsWith('/')) {
                normalizedUrl = normalizedUrl.slice(0, -1);
            }

            // 変更前の警告と確認
            setIsChanging(true);

            notifications.show({
                title: '確認',
                message: 'サーバーを変更すると再度ログインが必要になります。続行しますか？',
                color: 'yellow',
                autoClose: false,
                withCloseButton: true,
                onClose: () => setIsChanging(false),
                id: 'server-change-confirm'
            });

            // 確認済みとなったらサーバー変更処理
            localStorage.setItem('misskey_server', normalizedUrl);
            localStorage.removeItem('misskey_token'); // 認証情報を削除

            notifications.update({
                id: 'server-change-confirm',
                title: 'サーバー変更完了',
                message: '設定を変更しました。ログイン画面にリダイレクトします。',
                color: 'green',
                autoClose: 3000,
            });

            // ログイン画面に戻る
            setTimeout(() => {
                router.push('/login');
            }, 1500);

        } catch (error) {
            setIsChanging(false);
            notifications.show({
                title: 'エラー',
                message: 'サーバー設定の変更中にエラーが発生しました',
                color: 'red',
            });
            console.error('Server change error:', error);
        }
    };

    return (
        <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">サーバー設定</Title>

            <Box mb="md">
                <TextInput
                    label="Misskeyサーバー"
                    placeholder="例：virtualkemomimi.net"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    // icon={<IconServer size={16} />}
                    disabled={isChanging}
                />
            </Box>

            <Alert color="yellow" icon={<IconAlertCircle />} mb="md">
                <Text size="sm">サーバーを変更すると現在のセッションは終了し、再度ログインが必要になります。</Text>
            </Alert>

            <Button
                onClick={handleServerChange}
                loading={isChanging}
                color="cyan"
            >
                設定を保存
            </Button>
        </Paper>
    );
}