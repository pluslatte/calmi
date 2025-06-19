import useConfirmationModal from "@/hooks/useConfirmationModal";
import { MisskeyAccountPublic } from "@/types/accounts";
import { Stack, Title, Alert, Card, Group, Avatar, Badge, Button, Text } from "@mantine/core";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useState } from "react";

interface Props {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
    handlerDelete: (accountId: string) => void;
}
const RegisteredAccountList = ({
    accounts,
    activeAccountId,
    handlerDelete,
}: Props
) => {
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const confirmationModal = useConfirmationModal(async () => {
        if (!deleteTargetId) {
            console.warn('deleteTargetId is not set');
            return;
        }
        handlerDelete(deleteTargetId);
        setDeleteTargetId(null);
    });

    const openDeleteModal = (accountId: string) => {
        setDeleteTargetId(accountId);
        confirmationModal.open();
    };

    return (
        <>
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
                                        disabled={confirmationModal.isLoading}
                                    >
                                        削除
                                    </Button>
                                </Group>
                            </Group>
                        </Card>
                    ))
                )}
            </Stack>

            <DeleteConfirmationModal
                opened={confirmationModal.opened}
                close={confirmationModal.close}
                onclick={confirmationModal.handleConfirm}
                loading={confirmationModal.isLoading}
            />
        </>
    )
}

export default RegisteredAccountList;