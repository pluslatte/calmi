import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useRegisteredAccountsList from "./useRegisteredAccountsList";
import { fetchAccountsApi } from "@/lib/misskey-api/accounts";
import { mockAccountsResponse } from "@/tests/fixtures";

vi.mock("@/lib/misskey-api/accounts", () => ({
    fetchAccountsApi: vi.fn(),
}));

const mockFetchAccountsApi = vi.mocked(fetchAccountsApi);

describe('useRegisteredAccountsList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('初期状態', () => {
        it('正しい初期値を返す', () => {
            const { result } = renderHook(() => useRegisteredAccountsList('unauthenticated'));

            expect(result.current.accounts).toEqual([]);
            expect(result.current.activeAccountId).toBeNull();
            expect(result.current.loadingAccounts).toBe(false);
            expect(result.current.refreshAccounts).toBeInstanceOf(Function);
        });
    });

    describe('sessionStatus が authenticated の場合', () => {
        it('マウント時にアカウントを自動的に取得する', async () => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);

            const { result } = await act(async () => {
                return renderHook(() => useRegisteredAccountsList('authenticated'));
            });

            expect(mockFetchAccountsApi).toHaveBeenCalledOnce();
            expect(result.current.accounts).toEqual(mockAccountsResponse.accounts);
            expect(result.current.activeAccountId).toBe(mockAccountsResponse.activeAccountId);
            expect(result.current.loadingAccounts).toBe(false);
        });

        it('エラーを処理し、API エラー時にアカウントを設定しない', async () => {
            const mockError = new Error('API Error');
            mockFetchAccountsApi.mockRejectedValue(mockError);

            const { result } = await act(async () => {
                return renderHook(() => useRegisteredAccountsList('authenticated'));
            });

            expect(mockFetchAccountsApi).toHaveBeenCalledOnce();
            expect(result.current.accounts).toEqual([]);
            expect(result.current.activeAccountId).toBeNull();
            expect(result.current.loadingAccounts).toBe(false);
        });
    });

    describe('sessionStatus が認証されていない場合', () => {
        it('アカウントを自動的に取得しない', () => {
            renderHook(() => useRegisteredAccountsList('unauthenticated'));

            expect(mockFetchAccountsApi).not.toHaveBeenCalled();
        });

        it('ローディング時にアカウントを取得しない', () => {
            renderHook(() => useRegisteredAccountsList('loading'));

            expect(mockFetchAccountsApi).not.toHaveBeenCalled();
        });
    });

    describe('refreshAccounts 関数', () => {
        it('手動で呼び出されたときにアカウントを取得する', async () => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);

            const { result } = renderHook(() => useRegisteredAccountsList('unauthenticated'));

            expect(result.current.loadingAccounts).toBe(false);

            await act(async () => {
                await result.current.refreshAccounts();
            });

            expect(mockFetchAccountsApi).toHaveBeenCalledOnce();
            expect(result.current.accounts).toEqual(mockAccountsResponse.accounts);
            expect(result.current.activeAccountId).toBe(mockAccountsResponse.activeAccountId);
            expect(result.current.loadingAccounts).toBe(false);
        });

        it('ローディング状態を適切にクリーンアップする', async () => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);

            const { result } = renderHook(() => useRegisteredAccountsList('unauthenticated'));

            expect(result.current.loadingAccounts).toBe(false);

            await act(async () => {
                await result.current.refreshAccounts();
            });

            expect(result.current.loadingAccounts).toBe(false);
        });

        it('エラーを処理してローディング状態をリセットする', async () => {
            const mockError = new Error('API Error');
            mockFetchAccountsApi.mockRejectedValue(mockError);

            const { result } = renderHook(() => useRegisteredAccountsList('unauthenticated'));

            await expect(
                act(async () => {
                    await result.current.refreshAccounts();
                })
            ).rejects.toThrow('API Error');

            expect(result.current.loadingAccounts).toBe(false);
            expect(result.current.accounts).toEqual([]);
            expect(result.current.activeAccountId).toBeNull();
        });
    });

    describe('sessionStatus の変更', () => {
        it('sessionStatus が loading から authenticated に変更されたときにアカウントを取得する', async () => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);

            const { result, rerender } = await act(async () => {
                return renderHook(
                    ({ sessionStatus }: { sessionStatus: 'loading' | 'authenticated' | 'unauthenticated' }) => useRegisteredAccountsList(sessionStatus),
                    { initialProps: { sessionStatus: 'loading' as 'loading' | 'authenticated' | 'unauthenticated' } }
                );
            });

            expect(mockFetchAccountsApi).not.toHaveBeenCalled();

            await act(async () => {
                rerender({ sessionStatus: 'authenticated' as const });
            });

            expect(mockFetchAccountsApi).toHaveBeenCalledOnce();
            expect(result.current.accounts).toEqual(mockAccountsResponse.accounts);
        });
    });
});
