import { fetchAccountsApi } from "@/lib/misskey-api/accounts";
import { notifyFailure } from "@/lib/notifications";
import { MisskeyAccountPublic } from "@/types/accounts";
import { useCallback, useEffect, useState } from "react";

const useRegisteredAccountsList = (sessionStatus: 'loading' | 'authenticated' | 'unauthenticated') => {
    const [accounts, setAccounts] = useState<MisskeyAccountPublic[]>([]);
    const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);

    const refreshAccounts = useCallback(async () => {
        setLoadingAccounts(true);
        const data = await fetchAccountsApi().catch(error => {
            setLoadingAccounts(false);
            throw error;
        });
        if (data) {
            setAccounts(data.accounts);
            setActiveAccountId(data.activeAccountId);
        }
        setLoadingAccounts(false);
    }, []);

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            refreshAccounts().catch((error) => {
                notifyFailure(error);
            });
        }
    }, [sessionStatus, refreshAccounts]);

    return {
        accounts,
        activeAccountId,
        loadingAccounts,
        refreshAccounts,
    }
};

export default useRegisteredAccountsList;