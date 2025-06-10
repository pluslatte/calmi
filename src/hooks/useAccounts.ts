import { notifications } from "@mantine/notifications";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";

export type MisskeyAccountPublic = Prisma.MisskeyAccountGetPayload<{
    select: {
        id: true;
        instanceUrl: true;
        username: true;
        displayName: true;
        avatarUrl: true;
        createdAt: true;
    }
}>;

export interface AccountsData {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
};

export interface ErrorResponse {
    error: string;
}

export interface RegisterAccountResponse {
    success: true;
    account: MisskeyAccountPublic;
}

export const fetchAccounts = async (
    setAccounts: (misskeyAccountPublics: MisskeyAccountPublic[]) => void,
    setActiveAccountId: (accountId: string | null) => void,
    setLoadingAccounts: (isLoading: boolean) => void, // こいつ表示のロジックやん
) => {
    try {
        const response = await fetch('/api/misskey-accounts');
        if (response.ok) {
            const data: AccountsData = await response.json();
            setAccounts(data.accounts);
            setActiveAccountId(data.activeAccountId);
        } else {
            const errorData: ErrorResponse = await response.json();
            notifications.show({
                title: 'エラー',
                message: errorData.error || 'アカウント情報の取得に失敗しました',
                color: 'red',
            });
        }
    } catch (error) {
        console.error("Failed to fetch accounts:", error);
        notifications.show({
            title: 'エラー',
            message: '不明なエラー',
            color: 'red',
        });
    } finally {
        setLoadingAccounts(false);
    }
}

const useAccounts = (sessionStatus: 'loading' | 'authenticated' | 'unauthenticated') => {
    const [accounts, setAccounts] = useState<MisskeyAccountPublic[]>([]);
    const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            fetchAccounts(setAccounts, setActiveAccountId, setLoadingAccounts);
        }
    }, [sessionStatus]);

    return {
        accounts,
        activeAccountId,
        loadingAccounts,
        setAccounts,
        setActiveAccountId,
        setLoadingAccounts,
    }
};

export default useAccounts;