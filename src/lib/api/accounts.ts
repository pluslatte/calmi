import { MisskeyAccountPublic } from "@/hooks/useAccounts";

export interface FetchAccountsApiResponse {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
}

export interface RegisterAccountApiResponse {
    success: true;
    account: MisskeyAccountPublic;
}

export interface ErrorResponse {
    error: string;
}

export const fetchAccountsApi = async (): Promise<FetchAccountsApiResponse> => {
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

export const registerAccountApi = async (
    instanceUrl: string,
    accessToken: string,
): Promise<RegisterAccountApiResponse> => {
    const response = await fetch('/api/misskey-accounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instanceUrl: instanceUrl.replace(/\/$/, ''), // 末尾のスラッシュを除去
            accessToken,
        }),
    });

    if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error);
    }

    return await response.json();
}