"use client";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import { Stack, Title, Alert, Loader } from "@mantine/core";
import ConfirmationModal from "./ConfirmationModal";
import RegisteredAccountCard from "./RegisteredAccountCard";
import React, { useState } from "react";
import { deleteAccountApi, fetchAccountsApi } from "@/lib/db/misskey-accounts";
import { notifySuccess } from "@/lib/notifications";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { MisskeyAccountPublic } from "@/types/accounts";

interface RegisteredAccountListContentProps {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
}
const RegisteredAccountListContent = (props: RegisteredAccountListContentProps) => {
    const { accounts, activeAccountId } = props;

    const queryClient = useQueryClient();
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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
        <React.Fragment>
            <Stack gap="md" mb="xl">
                <Title order={2} size="h3">登録済みアカウント</Title>

                {accounts.length === 0 ? (
                    <Alert color="blue">
                        アカウントが登録されていません。下記のフォームから登録してください。
                    </Alert>
                ) : (
                    accounts.map((account) => (
                        <RegisteredAccountCard
                            key={account.id}
                            account={account}
                            isActive={account.id === activeAccountId}
                            onDelete={(accountId: string) => {
                                setDeleteTargetId(accountId);
                                confirmationModal.open();
                            }}
                            isDeleting={deleteMutation.isPending}
                        />
                    ))
                )}
            </Stack>

            <ConfirmationModal
                opened={confirmationModal.opened}
                close={confirmationModal.close}
                onclick={confirmationModal.handleConfirm}
                title="アカウント削除の確認"
                message="アカウントの登録を解除しますか？この操作は取り消せません。"
            />
        </React.Fragment>
    )
};

const RegisteredAccountList = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: queryKeys.api.misskeyAccounts(),
        queryFn: fetchAccountsApi,
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
                <RegisteredAccountListContent
                    accounts={data.accounts}
                    activeAccountId={data.activeAccountId}
                />
            )}
        </div>
    )
}

export default RegisteredAccountList;