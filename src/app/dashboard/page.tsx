'use client';
import { signOut } from "@/../auth";
import { Alert, Avatar, Badge, Button, Card, Container, Group, Loader, Modal, Stack, TextInput, Title, Text } from "@mantine/core";
import { Prisma } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { propagateServerField } from "next/dist/server/lib/render-server";

type MisskeyAccountPublic = Prisma.MisskeyAccountGetPayload<{
    select: {
        id: true;
        instanceUrl: true;
        username: true;
        displayName: true;
        avatarUrl: true;
        createdAt: true;
    }
}>;

interface AccountsData {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
};

interface RegisterAccountResponse {
    success: true;
    account: MisskeyAccountPublic;
}

interface ErrorResponse {
    error: string;
}

const fetchAccounts = async (
    setAccounts: (misskeyAccountPublics: MisskeyAccountPublic[]) => void,
    setActiveAccountId: (accountId: string | null) => void,
    setLoading: (isLoading: boolean) => void, // こいつ表示のロジックやん
) => {
    try {
        const response = await fetch('/api/misskey-accounts');
        if (response.ok) {
            const data: AccountsData = await response.json();
            setAccounts(data.accounts);
            setActiveAccountId(data.activeAccountId);
        } else {
            const errorData: ErrorResponse = await response.json();
            notifications.show({
                title: 'エラー',
                message: errorData.error || 'アカウント情報の取得に失敗しました',
                color: 'red',
            });
        }
    } catch (error) {
        console.error("Failed to fetch accounts:", error);
        notifications.show({
            title: 'エラー',
            message: '不明なエラー',
            color: 'red',
        });
    } finally {
        setLoading(false);
    }
}

const handleRegisterImpl = async (
    e: React.FormEvent,
    instanceUrl: string | null, // This shouldn't be null
    accessToken: string | null, // This shouldn't be null
    setAccounts: (misskeyAccountPublics: MisskeyAccountPublic[]) => void,
    setActiveAccountId: (accountId: string | null) => void,
    setLoading: (isLoading: boolean) => void, // こいつ表示のロジックやん
    setSubmitting: (isSubmitting: boolean) => void,
    setInstanceUrl: (instanceUrl: string) => void,
    setAccessToken: (token: string) => void,
) => {
    e.preventDefault();
    if (!instanceUrl || !accessToken) {
        notifications.show({
            title: 'エラー',
            message: 'すべての項目を入力してください',
            color: 'red',
        });
        return;
    }

    setSubmitting(true);
    try {
        const response = await fetch('/api/misskey-accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instanceUrl: instanceUrl.replace(/\/$/, ''), // 末尾のスラッシュを除去
                accessToken,
            }),
        });

        if (response.ok) {
            const result: RegisterAccountResponse = await response.json();
            notifications.show({
                title: '成功',
                message: `${result.account.displayName}のアカウントが登録されました`,
                color: 'green',
            });
            setInstanceUrl('');
            setAccessToken('');
            fetchAccounts(setAccounts, setActiveAccountId, setLoading); // 一覧を再取得
        } else {
            const errorData: ErrorResponse = await response.json();
            notifications.show({
                title: 'エラー',
                message: errorData.error || '登録に失敗しました',
                color: 'red',
            });
        }
    } catch (error) {
        console.error('Failed to register account:', error);
        notifications.show({
            title: 'エラー',
            message: '不明なエラー',
            color: 'red',
        });
    } finally {
        setSubmitting(false);
    }
}

const handleDelete = async (
    accountId: string,
    setAccounts: (misskeyAccountPublics: MisskeyAccountPublic[]) => void,
    setActiveAccountId: (accountId: string | null) => void,
    setLoading: (isLoading: boolean) => void, // こいつ表示のロジックやん
    setDeleteTargetId: (deleteTargetId: string | null) => void,
    close: () => void,
) => {
    try {
        const response = await fetch(`/api/misskey-accounts/${accountId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            notifications.show({
                title: '成功',
                message: 'アカウントが削除されました',
                color: 'green',
            });
            fetchAccounts(setAccounts, setActiveAccountId, setLoading); // 一覧を再取得
        } else {
            const errorData: ErrorResponse = await response.json();
            notifications.show({
                title: 'エラー',
                message: errorData.error || '削除に失敗しました',
                color: 'red',
            });
        }
    } catch (error) {
        console.error('Failed to delete account:', error);
        notifications.show({
            title: 'エラー',
            message: 'ネットワークエラーが発生しました',
            color: 'red',
        });
    } finally {
        close();
        setDeleteTargetId(null);
    }
};

function DeleteConfirmationModal({
    opened,
    close,
    confirmAccountDeletion,
}: {
    opened: boolean;
    close: () => void;
    confirmAccountDeletion: () => "" | Promise<void> | null;
}
) {

    return (
        <Modal opened={opened} onClose={close} title="アカウント削除の確認">
            <Text mb="md">
                このアカウントを削除してもよろしいですか？この操作は取り消せません。
            </Text>
            <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={close}>
                    キャンセル
                </Button>
                <Button
                    color="red"
                    onClick={confirmAccountDeletion}
                >
                    削除
                </Button>
            </Group>
        </Modal>
    )
}

function NewAccountRegistrationForm({
    submitting,
    setAccounts,
    setActiveAccountId,
    setLoading,
    setSubmitting,
}: {
    submitting: boolean;
    setAccounts: (misskeyAccountPublics: MisskeyAccountPublic[]) => void;
    setActiveAccountId: (activeAccountId: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    setSubmitting: (isSubmitting: boolean) => void;
}) {
    const [instanceUrl, setInstanceUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        handleRegisterImpl(
            e,
            instanceUrl,
            accessToken,
            setAccounts,
            setActiveAccountId,
            setLoading,
            setSubmitting,
            setInstanceUrl,
            setAccessToken
        );
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">新規アカウント登録</Title>
            <form onSubmit={handleRegister}>
                <Stack gap="md">
                    <TextInput
                        label="インスタンスURL"
                        placeholder="https://misskey.io"
                        value={instanceUrl}
                        onChange={(e) => setInstanceUrl(e.target.value)}
                        required
                    />
                    <TextInput
                        label="アクセストークン"
                        placeholder="APIキーを入力してください"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        type="password"
                        required
                    />
                    <Button
                        type="submit"
                        loading={submitting}
                        disabled={!instanceUrl || !accessToken}
                    >
                        登録
                    </Button>
                </Stack>
            </form>
        </Card>
    )
}

function RegisteredAccountList({
    accounts,
    activeAccountId,
    openDeleteModal,
}: {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
    openDeleteModal: (accountId: string) => void;
}) {
    return (
        <Stack gap="md" mb="xl">
            <Title order={2} size="h3">登録済みアカウント</Title>

            {accounts.length === 0 ? (
                <Alert color="blue">
                    アカウントが登録されていません。下記のフォームから登録してください。
                </Alert>
            ) : (
                accounts.map((account) => (
                    <Card key={account.id} shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between">
                            <Group gap="md">
                                <Avatar
                                    src={account.avatarUrl}
                                    size="md"
                                    radius="xl"
                                />
                                <div>
                                    <Text fw={500}>{account.displayName}</Text>
                                    <Text size="sm" c="dimmed">
                                        @{account.username}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {account.instanceUrl}
                                    </Text>
                                </div>
                            </Group>

                            <Group gap="sm">
                                {account.id === activeAccountId && (
                                    <Badge color="green">アクティブ</Badge>
                                )}
                                <Button
                                    color="red"
                                    size="xs"
                                    variant="outline"
                                    onClick={() => openDeleteModal(account.id)}
                                >
                                    削除
                                </Button>
                            </Group>
                        </Group>
                    </Card>
                ))
            )}
        </Stack>
    )
}

export default function Dashboard() {
    const { data: session, status } = useSession();

    const [accounts, setAccounts] = useState<MisskeyAccountPublic[]>([]);
    const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const confirmAccountDeletion = () => deleteTargetId && handleDelete(
        deleteTargetId,
        setAccounts,
        setActiveAccountId,
        setLoading,
        setDeleteTargetId,
        close
    );

    const openDeleteModal = (accountId: string) => {
        setDeleteTargetId(accountId);
        open();
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAccounts(setAccounts, setActiveAccountId, setLoading);
        }
    }, [status]);

    if (loading || status === 'loading') {
        return (
            <Container size="md" py="xl">
                <Group justify="center">
                    <Loader size="lg" />
                </Group>
            </Container>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <Container size="md" py="xl">
                <Group justify="center">
                    <Text>Access  Denied</Text>
                </Group>
            </Container>
        );
    }

    return (
        <Container size="md" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={1}>ダッシュボード</Title>
                <Button
                    color="red"
                    onClick={() => signOut()}
                >
                    サインアウト
                </Button>
            </Group>

            <RegisteredAccountList
                accounts={accounts}
                activeAccountId={activeAccountId}
                openDeleteModal={openDeleteModal}
            />

            <NewAccountRegistrationForm
                submitting={submitting}
                setAccounts={setAccounts}
                setActiveAccountId={setActiveAccountId}
                setLoading={setLoading}
                setSubmitting={setSubmitting}
            />

            <DeleteConfirmationModal
                opened={opened}
                close={close}
                confirmAccountDeletion={confirmAccountDeletion}
            />
        </Container>
    );
}