import { Avatar, Box, Group, Menu, ActionIcon, Text, Skeleton, Paper, Flex } from '@mantine/core';
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useMisskeyApiStore } from '@/stores/useMisskeyApiStore';
import { useEffect, useState } from 'react';
import { User } from 'misskey-js/entities.js';
import { useRouter } from "next/navigation";

export default function UserHeader() {
    const { getUserInfo, logout, isLoggedIn } = useMisskeyApiStore();
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setLoading(true);
                const info = await getUserInfo();
                setUserInfo(info);
            } catch (error) {
                console.error('ユーザー情報の取得に失敗しました:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchUserInfo();
        }
    }, [getUserInfo, isLoggedIn]);

    // ログアウト処理
    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <Paper m="xs">
            <Flex justify="space-between" align="center">
                {loading ? (
                    <Group>
                        <Skeleton height={40} circle />
                        <Box>
                            <Skeleton height={15} width={120} mb="xs" />
                            <Skeleton height={10} width={80} />
                        </Box>
                    </Group>
                ) : (
                    <Group>
                        <Avatar
                            src={userInfo?.avatarUrl}
                            size="md"
                            radius="md"
                        />
                        <Box>
                            <Text fw={600}>{userInfo?.name || userInfo?.username}</Text>
                            <Text size="xs" c="dimmed">@{userInfo?.username}{userInfo?.host ? `@${userInfo.host}` : ''}</Text>
                        </Box>
                    </Group>
                )}

                <Group>
                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="outline">
                                <IconUser size={18} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>アカウント</Menu.Label>
                            <Menu.Item
                                leftSection={<IconSettings size={14} />}
                                disabled
                            >
                                設定
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<IconLogout size={14} />}
                                onClick={handleLogout}
                                color="red"
                            >
                                ログアウト
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Flex>
        </Paper>
    );
}