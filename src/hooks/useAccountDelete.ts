import { useState } from "react";
import { deleteAccountApi } from "@/lib/api/accounts";

const useAccountDelete = (
    onAccountDeleted: () => void
) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteAccount = async (accountId: string) => {
        setIsDeleting(true);
        await deleteAccountApi(accountId).catch(error => {
            setIsDeleting(false);
            throw error;
        });
        onAccountDeleted();
        setIsDeleting(false);
    };

    return {
        isDeleting,
        deleteAccount,
    }
}

export default useAccountDelete;