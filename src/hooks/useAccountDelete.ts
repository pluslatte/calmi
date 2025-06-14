import { useState } from "react";
import { deleteAccountApi } from "@/lib/misskey-api/accounts";

const useAccountDelete = (
    onAccountDeleted: () => void
) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteAccount = async (accountId: string) => {
        setIsDeleting(true);
        try {
            await deleteAccountApi(accountId);
            onAccountDeleted();
        } catch (error) {
            throw error;
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