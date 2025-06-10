import useAccountDeleteConfirmationModal from "@/hooks/useAccountDeleteConfirmationModal";
import { MisskeyAccountPublic } from "@/hooks/useAccounts";
import { Stack, Title, Alert, Card, Group, Avatar, Badge, Button, Text } from "@mantine/core";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import LoadHider from "./LoadHider";

interface Props {
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
}: Props
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

export default RegisteredAccountList;