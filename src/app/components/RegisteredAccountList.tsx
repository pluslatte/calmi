import useConfirmationModal from "@/hooks/useConfirmationModal";
import { MisskeyAccountPublic } from "@/types/accounts";
import { Stack, Title, Alert, Card, Group, Avatar, Badge, Button, Text, Loader } from "@mantine/core";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useState } from "react";
import { deleteAccountApi, fetchAccountsApi } from "@/lib/misskey-api/accounts";
import { notifySuccess } from "@/lib/notifications";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";

const RegisteredAccountList = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: queryKeys.api.misskeyAccounts(),
        queryFn: fetchAccountsApi,
    });

    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: deleteAccountApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.api.misskeyAccounts() });
            notifySuccess("アカウントを削除しました");
        },
    });

    const handlerDelete = (accountId: string) => {
        deleteMutation.mutate(accountId)
    };

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
        <div data-testid="registered-account-list">
            {isPending && (
                <Group justify="center">
                    <Loader size="lg" />
                </Group>
            )}

            {isError && (
                <Alert color="red">
                    アカウント情報の取得に失敗しました
                </Alert>
            )}

            {data && (
                <Stack gap="md" mb="xl">
                    <Title order={2} size="h3">登録済みアカウント</Title>

                    {data.accounts.length === 0 ? (
                        <Alert color="blue">
                            アカウントが登録されていません。下記のフォームから登録してください。
                        </Alert>
                    ) : (
                        data.accounts.map((account) => (
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
                                        {account.id === data.activeAccountId && (
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
            )}

            <DeleteConfirmationModal
                opened={confirmationModal.opened}
                close={confirmationModal.close}
                onclick={confirmationModal.handleConfirm}
                loading={confirmationModal.isLoading}
            />
        </div>
    )
}

export default RegisteredAccountList;