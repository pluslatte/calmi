'use client';
import { signOut } from "@/../auth";
import { Alert, Avatar, Badge, Button, Card, Container, Group, Loader, Stack, Title, Text } from "@mantine/core";
import React, { ReactNode } from "react";
import { useSession } from "next-auth/react";
import useAccounts, { MisskeyAccountPublic } from "@/hooks/useAccounts";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import LoadHider from "../components/LoadHider";
import useAccountDeleteConfirmationModal from "@/hooks/useAccountDeleteConfirmationModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

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