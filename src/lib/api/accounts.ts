import { MisskeyAccountPublic } from "@/hooks/useAccounts";

export interface AccountsApiResponse {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
}

export interface ErrorResponse {
    error: string;
}

export const fetchAccountsApi = async (): Promise<AccountsApiResponse> => {
    const response = await fetch('/api/misskey-accounts');
    if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'failed to fetch account data');
    }
    return response.json();
};

export const deleteAccountApi = async (accountId: string): Promise<void> => {
    const response = await fetch(`/api/misskey-accounts/${accountId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'failed to delete account data');
    }
};