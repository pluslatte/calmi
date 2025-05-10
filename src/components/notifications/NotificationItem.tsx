// src/components/notifications/NotificationItem.tsx
import { Anchor, Avatar, Badge, Box, Group, Text } from "@mantine/core";
import { Notification } from "misskey-js/entities.js";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { IconArrowRight, IconPhoto } from "@tabler/icons-react";
import MfmObject from "@/components/MfmObject";
import * as mfm from 'mfm-js';
import NotificationContent from "./NotificationContent";
import { getNotificationIcon, getNotificationStyle, hasNoteText, hasUserAvatar } from "./NotificationUtils";
import React from "react";

interface NotificationItemProps {
    notification: Notification;
    lastReadAt: Date | null;
    handleViewNote: (noteId: string, event: React.MouseEvent) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    lastReadAt,
    handleViewNote,
}) => {
    return (
        <Box
            style={{
                backgroundColor: 'var(--mantine-color-body)',
            }}
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
    );
};

export default NotificationItem;