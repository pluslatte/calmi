// src/components/notifications/NotificationList.tsx
import { Box, Loader, Paper, ScrollArea, Text } from "@mantine/core";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NotificationItem from "./NotificationItem";

interface NotificationListProps {
    // NotificationListは枠付きのコンテナとしてレンダリング
    withContainer?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({ withContainer = true }) => {
    const router = useRouter();
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

    // ノートリンクをクリックしたときの処理
    const handleViewNote = (noteId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // 親要素のクリックイベントを停止
        // Next.jsのルーターを使ってノート表示ページに遷移
        router.push(`/note/${noteId}`);
    };

    const renderContent = () => {
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

        if (notifications.length === 0) {
            return (
                <Text c="dimmed" ta="center" py="md">
                    通知はありません
                </Text>
            );
        }

        return (
            <>
                {notifications.map((notification) => (
                    <Box key={notification.id} mb="xs">
                        <NotificationItem
                            notification={notification}
                            lastReadAt={lastReadAt}
                            handleViewNote={handleViewNote}
                        />
                    </Box>
                ))}
            </>
        );
    };

    // ラッパーの有無で分岐
    if (withContainer) {
        return (
            <Paper p="sm" withBorder style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <ScrollArea h="100%" type="scroll" style={{ flex: 1 }}>
                    {renderContent()}
                </ScrollArea>
            </Paper>
        );
    } else {
        return <Box p="xs">{renderContent()}</Box>;
    }
};

export default NotificationList;