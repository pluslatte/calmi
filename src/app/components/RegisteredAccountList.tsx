import useAccountDelete from "@/hooks/useAccountDelete";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import { MisskeyAccountPublic } from "@/types/accounts";
import { Stack, Title, Alert, Card, Group, Avatar, Badge, Button, Text } from "@mantine/core";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import LoadHider from "./LoadHider";
import { useState } from "react";
import { notifyFailure, notifySuccess } from "@/lib/notifications";

interface Props {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
    loading: boolean;
    onAccountDeleted: () => void; // コールバック関数に変更
}
const RegisteredAccountList = ({
    accounts,
    activeAccountId,
    loading,
    onAccountDeleted,
}: Props
) => {
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const { deleteAccount } = useAccountDelete(onAccountDeleted);

    const confirmationModal = useConfirmationModal(async () => {
        if (!deleteTargetId) {
            console.warn('deleteTargetId is not set');
            return;
        }
        try {
            await deleteAccount(deleteTargetId);
            notifySuccess('アカウントが削除されました');
        } catch (error) {
            notifyFailure(error);
        }
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
                                            disabled={confirmationModal.isLoading}
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
                opened={confirmationModal.opened}
                close={confirmationModal.close}
                onclick={confirmationModal.handleConfirm}
                loading={confirmationModal.isLoading}
            />
        </>
    )
}

export default RegisteredAccountList;