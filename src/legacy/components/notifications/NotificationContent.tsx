// src/components/notifications/NotificationContent.tsx
import { Box, Text } from "@mantine/core";
import { Notification } from "misskey-js/entities.js";
import EmojiNode from "@/components/EmojiNode";

// リアクション絵文字を表示するコンポーネント
export const ReactionEmoji = ({ notification }: { notification: Notification }) => {
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

// 通知内容のコンポーネント
const NotificationContent = ({ notification }: { notification: Notification }) => {
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
                    リアクションしました: <ReactionEmoji notification={notification} />
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

export default NotificationContent;