import { Box, Paper, Title, Divider, Text, Loader, Avatar, Group, UnstyledButton, ActionIcon, ScrollArea, Flex } from "@mantine/core";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { IconBell, IconCheck, IconUser, IconHeart, IconRepeat, IconMessageCircle, IconHash, IconInfoCircle } from "@tabler/icons-react";
import { Notification } from "misskey-js/entities.js";

export default function NotificationList() {
    const { client } = useMisskeyApiStore();
    const {
        notifications,
        unreadCount,
        isLoading,
        hasError,
        lastReadAt,
        initializeNotifications,
        loadNotifications,
        markAsRead
    } = useNotificationStore();

    useEffect(() => {
        if (client) {
            initializeNotifications(client);
            loadNotifications(client);
        }

        return () => {
            // クリーンアップ処理
        };
    }, [client, initializeNotifications, loadNotifications]);

    // 開いた時に既読にする
    useEffect(() => {
        if (unreadCount > 0) {
            markAsRead();
        }
    }, [unreadCount, markAsRead]);

    // 通知タイプごとのアイコンを取得
    const getNotificationIcon = (notification: Notification) => {
        switch (notification.type) {
            case 'follow':
                return <IconUser size={18} color="#3498db" />;
            case 'mention':
            case 'reply':
                return <IconMessageCircle size={18} color="#2ecc71" />;
            case 'renote':
            case 'quote':
                return <IconRepeat size={18} color="#9b59b6" />;
            case 'reaction':
                return <IconHeart size={18} color="#e74c3c" />;
            case 'pollEnded':
                return <IconHash size={18} color="#f39c12" />;
            case 'roleAssigned':
                return <IconInfoCircle size={18} color="#1abc9c" />;
            default:
                return <IconBell size={18} color="#7f8c8d" />;
        }
    };

    // 通知の内容を取得
    const getNotificationContent = (notification: Notification) => {
        switch (notification.type) {
            case 'follow':
                return `${notification.user?.name || notification.user?.username} さんにフォローされました`;
            case 'mention':
                return `${notification.user?.name || notification.user?.username} さんからメンションされました`;
            case 'reply':
                return `${notification.user?.name || notification.user?.username} さんから返信がありました`;
            case 'renote':
                return `${notification.user?.name || notification.user?.username} さんがリノートしました`;
            case 'reaction':
                return `${notification.user?.name || notification.user?.username} さんがリアクションしました: ${notification.reaction}`;
            case 'roleAssigned':
                return `ロール「${notification.role?.name}」が割り当てられました`;
            default:
                return `新しい通知があります`;
        }
    };

    // ユーザーアバターを表示するかどうかを判定
    const hasUserAvatar = (notification: Notification) => {
        return ['follow', 'mention', 'reply', 'renote', 'reaction', 'quote', 'user'].includes(notification.type);
    };

    // ノートテキストを表示するかどうかを判定
    const hasNoteText = (notification: Notification) => {
        return notification.type === 'mention' || notification.type === 'reply' || notification.type === 'quote';
    };

    if (isLoading && notifications.length === 0) {
        return (
            <Box py="xl" ta="center">
                <Loader size="md" />
                <Text mt="md">通知を読み込んでいます...</Text>
            </Box>
        );
    }

    if (hasError) {
        return (
            <Box py="xl" ta="center">
                <Text c="red">通知の読み込みに失敗しました</Text>
            </Box>
        );
    }

    return (
        <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
                <Title order={4}>
                    <IconBell size={18} style={{ marginRight: 8 }} />
                    通知
                </Title>
                <Group gap="xs">
                    <Text size="sm" c="dimmed">
                        {unreadCount > 0 ? `${unreadCount}件の未読` : '既読'}
                    </Text>
                    {unreadCount > 0 && (
                        <ActionIcon size="sm" onClick={markAsRead} title="すべて既読にする">
                            <IconCheck size={16} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>

            <Divider mb="md" />

            <Box flex={1} style={{ overflow: "auto" }}>
                <ScrollArea type="auto">
                    {notifications.length === 0 ? (
                        <Text c="dimmed" ta="center" py="md">
                            通知はありません
                        </Text>
                    ) : (
                        notifications.map((notification) => (
                            <Box key={notification.id}>
                                <UnstyledButton
                                    onClick={() => {/* ノートへの遷移などの処理 */ }}
                                >
                                    <Paper
                                        p="xs"
                                        withBorder
                                        mb="xs"
                                        style={{
                                            borderLeft: lastReadAt && new Date(notification.createdAt) > lastReadAt
                                                ? '3px solid #3498db'
                                                : '1px solid #e0e0e0'
                                        }}
                                    >
                                        <Group wrap="nowrap" align="flex-start">
                                            {hasUserAvatar(notification) && 'user' in notification && notification.user ? (
                                                <Avatar
                                                    src={notification.user?.avatarUrl}
                                                    radius="md"
                                                    size="md"
                                                />
                                            ) : (
                                                <Box w={40} h={40} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {getNotificationIcon(notification)}
                                                </Box>
                                            )}
                                            <Box style={{ flex: 1 }}>
                                                <Group justify="space-between" mb={4}>
                                                    <Text size="sm" fw={500}>
                                                        {/* 通知タイプによって表示を分岐 */}
                                                        {hasUserAvatar(notification) && 'user' in notification
                                                            ? (notification.user?.name || notification.user?.username)
                                                            : '通知'}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ja })}
                                                    </Text>
                                                </Group>
                                                <Group gap="xs">
                                                    {getNotificationIcon(notification)}
                                                    <Text size="sm">
                                                        {getNotificationContent(notification)}
                                                    </Text>
                                                </Group>
                                                {hasNoteText(notification) && notification.note && (
                                                    <Text size="xs" c="dimmed" mt={4} lineClamp={2}>
                                                        {notification.note.text}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Group>
                                    </Paper>
                                </UnstyledButton>
                            </Box>
                        ))
                    )}
                </ScrollArea>
            </Box>
        </Paper>
    );
}