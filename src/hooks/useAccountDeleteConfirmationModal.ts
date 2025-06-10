import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { ErrorResponse, fetchAccounts, MisskeyAccountPublic } from "./useAccounts";
import { notifications } from "@mantine/notifications";

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
        handlerConfirmAccountDeletion,
        openDeleteModal,
    }
}

export default useAccountDeleteConfirmationModal;