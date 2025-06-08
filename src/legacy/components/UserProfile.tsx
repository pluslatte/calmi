// src/components/UserProfile.tsx
/**
 * UserProfile - ユーザーのプロフィール情報を表示するコンポーネント
 * 
 * このコンポーネントはMisskeyユーザーの詳細情報を表示し、
 * ユーザー名やプロフィール文のMFM(Misskey Flavored Markdown)をサポートします。
 * バナー画像、アバター、ユーザー名、自己紹介文、および各種メタデータを表示します。
 */
import { Avatar, Box, Paper, Text, Group, Stack } from "@mantine/core";
import { UserDetailed } from "misskey-js/entities.js";
import { IconCalendar, IconLink } from "@tabler/icons-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import MfmObject from "./MfmObject";
import * as mfm from 'mfm-js';

interface UserProfileProps {
    user: UserDetailed;
}

export default function UserProfile({ user }: UserProfileProps) {
    return (
        <Paper p="md" withBorder radius="md" mb="md">
            <Box pos="relative">
                {/* バナー画像（存在する場合のみ表示） */}
                {user.bannerUrl && (
                    <Box
                        style={{
                            height: 150,
                            width: '100%',
                            backgroundImage: `url(${user.bannerUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '4px',
                            marginBottom: 50
                        }}
                    />
                )}

                {/* ユーザーアバター - バナー有無でスタイルを変更 */}
                <Avatar
                    src={user.avatarUrl}
                    size={80}
                    radius="md"
                    style={{
                        border: '3px solid white',
                        position: user.bannerUrl ? 'absolute' : 'static',
                        bottom: user.bannerUrl ? -40 : 'auto',
                        left: user.bannerUrl ? 20 : 'auto',
                    }}
                />
            </Box>

            <Box mt={user.bannerUrl ? 50 : 20}>
                {/* ユーザー名 - MFM対応 */}
                <Text size="xl" fw={700} mb={4}>
                    <MfmObject
                        mfmNodes={mfm.parse(user.name || user.username)}
                        assets={{ host: user.host, emojis: user.emojis }}
                    />
                </Text>

                {/* ユーザーID表示 */}
                <Text size="sm" c="dimmed" mb={16}>
                    @{user.username}{user.host ? `@${user.host}` : ''}
                </Text>

                {/* ユーザープロフィール文 - MFM対応 */}
                {user.description && (
                    <Box mb={16}>
                        <MfmObject
                            mfmNodes={mfm.parse(user.description)}
                            assets={{ host: user.host, emojis: user.emojis }}
                        />
                    </Box>
                )}

                {/* ユーザーメタデータセクション */}
                <Stack gap="xs">
                    {/* 誕生日情報（設定されている場合） */}
                    {user.birthday && (
                        <Group gap="xs">
                            <IconCalendar size={16} stroke={1.5} />
                            <Text size="sm">
                                {format(new Date(user.birthday), 'yyyy年MM月dd日', { locale: ja })}
                            </Text>
                        </Group>
                    )}

                    {/* URL情報（設定されている場合） */}
                    {user.url && (
                        <Group gap="xs">
                            <IconLink size={16} stroke={1.5} />
                            <Text size="sm" component="a" href={user.url} target="_blank" rel="noopener noreferrer">
                                {user.url}
                            </Text>
                        </Group>
                    )}

                    {/* フォロー・フォロワー統計 */}
                    <Group gap="md" mt="xs">
                        <Group gap="xs">
                            <Text fw={700}>{user.followersCount || 0}</Text>
                            <Text size="sm" c="dimmed">フォロワー</Text>
                        </Group>
                        <Group gap="xs">
                            <Text fw={700}>{user.followingCount || 0}</Text>
                            <Text size="sm" c="dimmed">フォロー</Text>
                        </Group>
                    </Group>
                </Stack>
            </Box>
        </Paper>
    );
}