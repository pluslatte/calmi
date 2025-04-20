import { Avatar, Box, Group, Menu, ActionIcon, Text, Skeleton, Paper, Flex, Switch } from '@mantine/core';
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useMisskeyApiStore } from '@/stores/useMisskeyApiStore';
import { useEffect, useState } from 'react';
import { User } from 'misskey-js/entities.js';
import { useRouter } from "next/navigation";
import { useUserSettingsStore } from "@/stores/useUserSettingsStore";

export default function UserFooter() {
    const { getUserInfo, logout, isLoggedIn } = useMisskeyApiStore();
    const { autoExpandCw, toggleAutoExpandCw } = useUserSettingsStore();
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
        <Paper
            withBorder
            p="xs"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                borderRadius: 0,
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none'
            }}
        >
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
                            style={{ cursor: 'pointer' }}
                            onClick={() => userInfo && router.push(`/user/${userInfo.id}`)}
                        />
                        <Box>
                            <Text fw={600}>{userInfo?.name || userInfo?.username}</Text>
                            <Text size="xs" c="dimmed">@{userInfo?.username}{userInfo?.host ? `@${userInfo.host}` : ''}</Text>
                        </Box>
                    </Group>
                )}

                <Group>
                    <Menu shadow="md" width={240} position="top-end">
                        <Menu.Target>
                            <ActionIcon variant="outline">
                                <IconUser size={18} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>アカウント</Menu.Label>
                            <Menu.Item
                                leftSection={<IconSettings size={14} />}
                            >
                                設定
                                <Box mt="xs">
                                    <Group justify="space-between">
                                        <Text size="sm">CWを自動的に展開</Text>
                                        <Switch
                                            checked={autoExpandCw}
                                            onChange={toggleAutoExpandCw}
                                            size="sm"
                                        />
                                    </Group>
                                </Box>
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