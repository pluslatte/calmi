import { mockAccountsResponse, mockErrorResponse, mockRegisterResponse } from "../data/accounts";

export const misskeyAccountsApi = {
    GET: {
        success: mockAccountsResponse,
        error: mockErrorResponse,
    },
    POST: {
        success: mockRegisterResponse,
        error: { error: 'Invalid access token' }
    }
}
export const misskeyAccountByIdApi = {
    DELETE: {
        success: { success: true },
        error: { error: 'Account not found' }
    }
}