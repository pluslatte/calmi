import { useState } from "react";
import { deleteAccountApi } from "@/lib/api/accounts";
import { notifyFailure, notifySuccess } from "@/lib/notifications";

const useAccountDelete = (
    onAccountDeleted: () => void
) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteAccount = async (accountId: string) => {
        setIsDeleting(true);
        try {
            await deleteAccountApi(accountId);
            notifySuccess('アカウントが削除されました');
            onAccountDeleted();
        } catch (error) {
            notifyFailure(error);
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