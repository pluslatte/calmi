'use client';
import { signOut } from "@/../auth";
import { Alert, Avatar, Badge, Button, Card, Container, Group, Loader, Modal, Stack, TextInput, Title, Text } from "@mantine/core";
import React, { ReactNode, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import useAccounts, { ErrorResponse, fetchAccounts, MisskeyAccountPublic, RegisterAccountResponse } from "@/hooks/useAccounts";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import LoadHider from "../components/LoadHider";

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

interface PropsDeleteConfirmationModal {
    opened: boolean;
    close: () => void;
    onclick: () => "" | Promise<void> | null;
}
const DeleteConfirmationModal = ({
    opened,
    close,
    onclick,
}: PropsDeleteConfirmationModal
) => {
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
                    onClick={onclick}
                >
                    削除
                </Button>
            </Group>
        </Modal>
    )
}

const useAccountDeleteConfirmationModal = (
    setAccounts: (misskeyAccountPublics: MisskeyAccountPublic[]) => void,
    setActiveAccountId: (activeAccountId: string | null) => void,
    setLoadingAccounts: (loadingAccounts: boolean) => void,
) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const handlerConfirmAccountDeletion = () => deleteTargetId && handleDelete(
        deleteTargetId,
        setAccounts,
        setActiveAccountId,
        setLoadingAccounts,
        setDeleteTargetId,
        close
    );

    const openDeleteModal = (accountId: string) => {
        setDeleteTargetId(accountId);
        open();
    };

    return {
        opened,
        deleteTargetId,
        setDeleteTargetId,
        handlerConfirmAccountDeletion,
        openDeleteModal,
    }
}

interface PropsRegisteredAccountList {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
    loading: boolean;
    setAccounts: (misskeyAccountPublics: MisskeyAccountPublic[]) => void,
    setActiveAccountId: (activeAccountId: string | null) => void,
    setLoadingAccounts: (loadingAccounts: boolean) => void,
}
const RegisteredAccountList = ({
    accounts,
    activeAccountId,
    loading,
    setAccounts,
    setActiveAccountId,
    setLoadingAccounts,
}: PropsRegisteredAccountList
) => {
    const {
        opened,
        deleteTargetId,
        setDeleteTargetId,
        handlerConfirmAccountDeletion,
        openDeleteModal,
    } = useAccountDeleteConfirmationModal(setAccounts, setActiveAccountId, setLoadingAccounts);

    return (
        <>
            <Stack gap="md" mb="xl">
                <Title order={2} size="h3">登録済みアカウント</Title>

                <LoadHider loading={loading}>
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
                </LoadHider>
            </Stack>

            <DeleteConfirmationModal
                opened={opened}
                close={close}
                onclick={handlerConfirmAccountDeletion}
            />
        </>
    )
}

interface PropsAuthenticationRequired {
    status: 'loading' | 'authenticated' | 'unauthenticated';
    children: ReactNode;
}
const AuthenticationRequired = ({ status, children }: PropsAuthenticationRequired) => {

    if (status === 'loading') {
        return (
            <Container size="md" py="xl">
                <Group justify="center">
                    <Loader size="lg" />
                    <Text>Checking authentication...</Text>
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

    return (<>{children}</>)
}

const AccountManager = () => {
    const { data: session, status } = useSession();

    const {
        accounts,
        activeAccountId,
        loadingAccounts,
        setAccounts,
        setActiveAccountId,
        setLoadingAccounts,
    } = useAccounts();

    return (
        <AuthenticationRequired
            status={status}
        >
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
                    loading={loadingAccounts}
                    setAccounts={setAccounts}
                    setActiveAccountId={setActiveAccountId}
                    setLoadingAccounts={setLoadingAccounts}
                />

                <NewAccountRegistrationForm
                    setAccounts={setAccounts}
                    setActiveAccountId={setActiveAccountId}
                    setLoading={setLoadingAccounts}
                />
            </Container>
        </AuthenticationRequired>
    );
}
export default AccountManager;