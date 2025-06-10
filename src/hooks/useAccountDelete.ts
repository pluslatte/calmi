import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { deleteAccountApi } from "@/lib/api/accounts";

const useAccountDelete = (
    onAccountDeleted: () => void
) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteAccount = async (accountId: string) => {
        setIsDeleting(true);
        try {
            await deleteAccountApi(accountId);
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
        }
    };

    return {
        isDeleting,
        deleteAccount,
    }
}

export default useAccountDelete;