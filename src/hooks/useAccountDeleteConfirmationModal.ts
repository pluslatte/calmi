import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { deleteAccountApi } from "@/lib/api/accounts";

const useAccountDeleteConfirmationModal = (
    onAccountDeleted: () => void
) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handlerConfirmAccountDeletion = async () => {
        if (!deleteTargetId) {
            console.warn('deleteTargetId is not set');
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAccountApi(deleteTargetId);
            notifications.show({
                title: '成功',
                message: 'アカウントが削除されました',
                color: 'green',
            });
            onAccountDeleted();
        } catch (error) {
            notifications.show({
                title: 'エラー',
                message: error instanceof Error ? error.message : 'ネットワークエラーが発生しました',
                color: 'red',
            });
        } finally {
            setIsDeleting(false);
            close();
            setDeleteTargetId(null);
        }
    };

    const openDeleteModal = (accountId: string) => {
        setDeleteTargetId(accountId);
        open();
    };

    return {
        opened,
        isDeleting,
        handlerConfirmAccountDeletion,
        openDeleteModal,
    }
}

export default useAccountDeleteConfirmationModal;