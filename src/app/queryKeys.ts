export const queryKeys = {
    all: ['calmi'] as const,
    api: {
        misskeyAccounts: () => [...queryKeys.all, 'api/misskeyAccounts'] as const,
    }
};