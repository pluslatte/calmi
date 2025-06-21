import useConfirmationModal from "@/hooks/useConfirmationModal";
import { Stack, Title, Alert, Loader } from "@mantine/core";
import ConfirmationModal from "./ConfirmationModal";
import RegisteredAccountCard from "./RegisteredAccountCard";
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

    const confirmationModal = useConfirmationModal(async () => {
        if (!deleteTargetId) {
            console.warn('deleteTargetId is not set');
            return;
        }
        deleteMutation.mutate(deleteTargetId)
        setDeleteTargetId(null);
    });

    return (
        <div>
            {isPending && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader size="lg" />
                </div>
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
                            <RegisteredAccountCard
                                key={account.id}
                                account={account}
                                isActive={account.id === data.activeAccountId}
                                onDelete={(accountId: string) => {
                                    setDeleteTargetId(accountId);
                                    confirmationModal.open();
                                }}
                                isDeleting={deleteMutation.isPending}
                            />
                        ))
                    )}
                </Stack>
            )}

            <ConfirmationModal
                opened={confirmationModal.opened}
                close={confirmationModal.close}
                onclick={confirmationModal.handleConfirm}
                title="アカウント削除の確認"
                message="アカウントの登録を解除しますか？この操作は取り消せません。"
            />
        </div>
    )
}

export default RegisteredAccountList;