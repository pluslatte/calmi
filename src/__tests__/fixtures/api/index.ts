import { misskeyAccountByIdApi, misskeyAccountsApi } from "./misskey-accounts";

export const apiResponses = {
    '/api/misskey-accounts': misskeyAccountsApi,
    '/api/misskey-accounts/:id': misskeyAccountByIdApi,
};

export {
    misskeyAccountsApi,
    misskeyAccountByIdApi
}