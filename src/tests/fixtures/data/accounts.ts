import { MisskeyAccountPublic } from "@/types/accounts";

interface AccountsData {
    accounts: MisskeyAccountPublic[];
    activeAccountId: string | null;
}

interface RegisterAccountResponse {
    success: true;
    account: MisskeyAccountPublic;
}

interface ErrorResponse {
    error: string;
}

export const mockMisskeyAccount: MisskeyAccountPublic = {
    id: 'test-account-1',
    instanceUrl: 'https://calmi.net',
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: new Date('2024-01-01'),
};

export const mockMisskeyAccounts: MisskeyAccountPublic[] = [
    mockMisskeyAccount,
    {
        id: 'test-account-2',
        instanceUrl: 'https://pluslatte.com',
        username: 'anotheruser',
        displayName: 'Another User',
        avatarUrl: 'https://example.com/avatar2.png',
        createdAt: new Date('2024-01-02'),
    }
];

export const mockAccountsResponse: AccountsData = {
    accounts: mockMisskeyAccounts,
    activeAccountId: 'test-account-1'
};

export const mockRegisterResponse: RegisterAccountResponse = {
    success: true,
    account: mockMisskeyAccount
};

export const mockErrorResponse: ErrorResponse = {
    error: 'Invalid access token'
};