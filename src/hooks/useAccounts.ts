import { fetchAccountsApi } from "@/lib/api/accounts";
import { notifyFailure } from "@/lib/notifications";
import { MisskeyAccountPublic } from "@/types/accounts";
import { useCallback, useEffect, useState } from "react";

const useAccounts = (sessionStatus: 'loading' | 'authenticated' | 'unauthenticated') => {
    const [accounts, setAccounts] = useState<MisskeyAccountPublic[]>([]);
    const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);

    const refreshAccounts = useCallback(async () => {
        setLoadingAccounts(true);
        try {
            const data = await fetchAccountsApi();
            setAccounts(data.accounts);
            setActiveAccountId(data.activeAccountId);
        } catch (error) {
            notifyFailure(error);
        } finally {
            setLoadingAccounts(false);
        }
    }, []);

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            refreshAccounts();
        }
    }, [sessionStatus, refreshAccounts]);

    return {
        accounts,
        activeAccountId,
        loadingAccounts,
        refreshAccounts,
    }
};

export default useAccounts;