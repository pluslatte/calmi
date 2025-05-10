// src/components/timeline/TimelineNotifications.tsx
import { Box, Text, Loader, Avatar, Group, UnstyledButton, ActionIcon, Badge, Anchor } from "@mantine/core";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { IconBell, IconUser, IconHeart, IconRepeat, IconMessageCircle, IconHash, IconInfoCircle, IconArrowRight, IconPhoto } from "@tabler/icons-react";
import { Notification } from "misskey-js/entities.js";
import MfmObject from "@/components/MfmObject";
import * as mfm from 'mfm-js';
import EmojiNode from "@/components/EmojiNode";
import { useRouter } from "next/navigation";

// 通知内容のコンポーネント - NotificationListから再利用
const NotificationContent = ({ notification }: { notification: Notification }) => {
    // ユーザー名部分をMfmObjectで表示
    const renderUserName = () => {
        if (!('user' in notification)) return null;

        const userName = notification.user.name || notification.user.username;
        return (
            <MfmObject
                mfmNodes={mfm.parse(`**${userName}**`)}
                assets={{
                    host: notification.user.host,
                    emojis: notification.user.emojis
                }}
            />
        );
    };

    // リアクション絵文字を表示するコンポーネント
    const ReactionEmoji = () => {
        if (notification.type !== 'reaction' || !notification.reaction) return null;

        // カスタム絵文字かどうかを判定
        const isCustomEmoji = notification.reaction.startsWith(':') && notification.reaction.endsWith(':');

        if (isCustomEmoji) {
            const emojiName = notification.reaction.slice(1, -1).split('@')[0];
            const emojiHost = notification.reaction.includes('@')
                ? notification.reaction.slice(1, -1).split('@')[1]
                : notification.user?.host || null;

            return (
                <Box component="span" mr={4} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <EmojiNode
                        name={emojiName}
                        assets={{
                            host: emojiHost,
                            emojis: notification.user?.emojis || {}
                        }}
                    />
                </Box>
            );
        }

        // 通常の絵文字の場合はそのまま表示
        return <Box component="span" mr={4}>{notification.reaction}</Box>;
    };

    switch (notification.type) {
        case 'follow':
            return (
                <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    フォローされました
                </Text>
            );
        case 'mention':
            return (
                <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    メンションされました
                </Text>
            );
        case 'reply':
            return (
                <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    返信がありました
                </Text>
            );
        case 'renote':
            return (
                <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    リノートされました
                </Text>
            );
        case 'quote':
            return (
                <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    引用リノートされました
                </Text>
            );
        case 'reaction':
            return (
                <Text size="sm" style={{ wordBreak: 'break-word', display: 'flex', alignItems: 'center' }}>
                    リアクションしました: <ReactionEmoji />
                </Text>
            );
        case 'roleAssigned':
            return (
                <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    ロール「{notification.role?.name}」が割り当てられました
                </Text>
            );
        default:
            return (
                <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    新しい通知があります
                </Text>
            );
    }
};

// タイムライン表示用に最適化された通知リスト
export default function TimelineNotifications() {
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

    // 通知タイプごとの背景色とボーダー色を取得
    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'reaction':
                return {
                    bg: 'rgba(231, 76, 60, 0.05)',
                    border: 'rgba(231, 76, 60, 0.5)'
                };
            case 'renote':
            case 'quote':
                return {
                    bg: 'rgba(155, 89, 182, 0.05)',
                    border: 'rgba(155, 89, 182, 0.5)'
                };
            case 'mention':
            case 'reply':
                return {
                    bg: 'rgba(46, 204, 113, 0.05)',
                    border: 'rgba(46, 204, 113, 0.5)'
                };
            default:
                return {
                    bg: 'rgba(0, 0, 0, 0.03)',
                    border: 'rgba(0, 0, 0, 0.1)'
                };
        }
    };

    // ノートリンクをクリックしたときの処理
    const handleViewNote = (noteId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // 親要素のクリックイベントを停止
        // Next.jsのルーターを使ってノート表示ページに遷移
        router.push(`/note/${noteId}`);
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
        <Box p="xs">
            {notifications.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                    通知はありません
                </Text>
            ) : (
                notifications.map((notification) => (
                    <Box key={notification.id} w="100%" mb="xs">
                        <Box
                            p="xs"
                            style={{
                                backgroundColor: 'var(--mantine-color-body)',
                                borderRadius: 'var(--mantine-radius-sm)',
                                borderLeft: lastReadAt && new Date(notification.createdAt) > lastReadAt
                                    ? '3px solid #3498db'
                                    : 'none',
                            }}
                            className="notification-item"
                        >
                            <Group wrap="nowrap" align="flex-start">
                                {hasUserAvatar(notification) && 'user' in notification && notification.user ? (
                                    <Anchor href={`/user/${notification.user.id}`}>
                                        <Avatar
                                            src={notification.user?.avatarUrl}
                                            radius="md"
                                            size="md"
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </Anchor>
                                ) : (
                                    <Box w={40} h={40} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {getNotificationIcon(notification)}
                                    </Box>
                                )}
                                <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Group justify="space-between" mb={4}>
                                        <Text size="sm" fw={500} lineClamp={1}>
                                            {/* ユーザー名をリンク化 */}
                                            {hasUserAvatar(notification) && 'user' in notification && notification.user ? (
                                                <Anchor href={`/user/${notification.user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <MfmObject
                                                        mfmNodes={mfm.parse(notification.user.name || notification.user.username)}
                                                        assets={{
                                                            host: notification.user.host,
                                                            emojis: notification.user.emojis
                                                        }}
                                                    />
                                                </Anchor>
                                            ) : (
                                                '通知'
                                            )}
                                        </Text>
                                        <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ja })}
                                        </Text>
                                    </Group>
                                    <Group gap="xs" style={{ flexWrap: 'nowrap' }}>
                                        <Box style={{ flexShrink: 0 }}>
                                            {getNotificationIcon(notification)}
                                        </Box>
                                        {/* 通知内容コンポーネント */}
                                        <NotificationContent notification={notification} />
                                    </Group>

                                    {/* リアクション対象ノートの表示 */}
                                    {notification.type === 'reaction' && notification.note && (
                                        <Box mt={4} p="xs" style={{
                                            background: getNotificationStyle('reaction').bg,
                                            borderRadius: '4px',
                                            borderLeft: `2px solid ${getNotificationStyle('reaction').border}`
                                        }}>
                                            <Group justify="space-between" mb={2}>
                                                <Text size="xs" fw={500}>リアクション対象のノート:</Text>
                                                <Badge
                                                    size="xs"
                                                    variant="outline"
                                                    color="red"
                                                    style={{ cursor: 'pointer' }}
                                                    rightSection={<IconArrowRight size={10} />}
                                                    onClick={(e) => handleViewNote(notification.note!.id, e)}
                                                >
                                                    ノートを表示
                                                </Badge>
                                            </Group>
                                            <Text size="xs" c="dimmed" lineClamp={2} style={{ wordBreak: 'break-word' }}>
                                                {notification.note.text || '(内容なし)'}
                                            </Text>
                                        </Box>
                                    )}

                                    {/* リノート対象ノートの表示 */}
                                    {(notification.type === 'renote' || notification.type === 'quote') && notification.note && (
                                        <Box mt={4} p="xs" style={{
                                            background: getNotificationStyle('renote').bg,
                                            borderRadius: '4px',
                                            borderLeft: `2px solid ${getNotificationStyle('renote').border}`
                                        }}>
                                            <Group justify="space-between" mb={2}>
                                                <Text size="xs" fw={500}>
                                                    {notification.type === 'renote' ? 'リノートされたノート:' : '引用リノートされたノート:'}
                                                </Text>
                                                <Badge
                                                    size="xs"
                                                    variant="outline"
                                                    color="violet"
                                                    style={{ cursor: 'pointer' }}
                                                    rightSection={<IconArrowRight size={10} />}
                                                    onClick={(e) => handleViewNote(notification.note!.id, e)}
                                                >
                                                    ノートを表示
                                                </Badge>
                                            </Group>
                                            <Text size="xs" c="dimmed" lineClamp={2} style={{ wordBreak: 'break-word' }}>
                                                {notification.note.text || '(内容なし)'}
                                            </Text>
                                            {notification.note.files && notification.note.files.length > 0 && (
                                                <Text size="xs" c="dimmed" mt={2}>
                                                    <IconPhoto size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                                    {notification.note.files.length}個のメディア
                                                </Text>
                                            )}
                                        </Box>
                                    )}

                                    {/* 返信・メンションノートの表示 */}
                                    {hasNoteText(notification) && notification.note &&
                                        !['reaction', 'renote'].includes(notification.type) && (
                                            <Box mt={4} p="xs" style={{
                                                background: getNotificationStyle('mention').bg,
                                                borderRadius: '4px',
                                                borderLeft: `2px solid ${getNotificationStyle('mention').border}`
                                            }}>
                                                <Group justify="space-between" mb={2}>
                                                    <Text size="xs" fw={500}>
                                                        {notification.type === 'reply' ? '返信内容:' : 'メンション内容:'}
                                                    </Text>
                                                    <Badge
                                                        size="xs"
                                                        variant="outline"
                                                        color="green"
                                                        style={{ cursor: 'pointer' }}
                                                        rightSection={<IconArrowRight size={10} />}
                                                        onClick={(e) => handleViewNote(notification.note!.id, e)}
                                                    >
                                                        ノートを表示
                                                    </Badge>
                                                </Group>
                                                <Text size="xs" c="dimmed" lineClamp={2} style={{ wordBreak: 'break-word' }}>
                                                    {notification.note.text || '(内容なし)'}
                                                </Text>
                                            </Box>
                                        )}
                                </Box>
                            </Group>
                        </Box>
                    </Box>
                ))
            )}
        </Box>
    );
}