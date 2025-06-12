import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useRegisteredAccountsList from "./useRegisteredAccountsList";
import { fetchAccountsApi } from "@/lib/api/accounts";
import { mockAccountsResponse } from "@/tests/fixtures";

vi.mock("@/lib/api/accounts", () => ({
    fetchAccountsApi: vi.fn(),
}));

const mockFetchAccountsApi = vi.mocked(fetchAccountsApi);

describe('useRegisteredAccountsList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('returns correct initial values', () => {
            const { result } = renderHook(() => useRegisteredAccountsList('unauthenticated'));

            expect(result.current.accounts).toEqual([]);
            expect(result.current.activeAccountId).toBeNull();
            expect(result.current.loadingAccounts).toBe(false);
            expect(result.current.refreshAccounts).toBeInstanceOf(Function);
        });
    });

    describe('when sessionStatus is authenticated', () => {
        it('automatically fetches accounts on mount', async () => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);

            const { result } = await act(async () => {
                return renderHook(() => useRegisteredAccountsList('authenticated'));
            });

            expect(mockFetchAccountsApi).toHaveBeenCalledOnce();
            expect(result.current.accounts).toEqual(mockAccountsResponse.accounts);
            expect(result.current.activeAccountId).toBe(mockAccountsResponse.activeAccountId);
            expect(result.current.loadingAccounts).toBe(false);
        });

        it('handles API error properly', async () => {
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

    describe('when sessionStatus is not authenticated', () => {
        it('does not fetch accounts automatically', () => {
            renderHook(() => useRegisteredAccountsList('unauthenticated'));

            expect(mockFetchAccountsApi).not.toHaveBeenCalled();
        });

        it('does not fetch accounts when loading', () => {
            renderHook(() => useRegisteredAccountsList('loading'));

            expect(mockFetchAccountsApi).not.toHaveBeenCalled();
        });
    });

    describe('refreshAccounts function', () => {
        it('fetches accounts when called manually', async () => {
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

        it('properly cleans loading state', async () => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);

            const { result } = renderHook(() => useRegisteredAccountsList('unauthenticated'));

            expect(result.current.loadingAccounts).toBe(false);

            await act(async () => {
                await result.current.refreshAccounts();
            });

            expect(result.current.loadingAccounts).toBe(false);
        });

        it('handles error and resets loading state', async () => {
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

    describe('sessionStatus change', () => {
        it('fetches accounts when sessionStatus changes to authenticated', async () => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);

            const { result, rerender } = renderHook(
                ({ sessionStatus }) => useRegisteredAccountsList(sessionStatus),
                { initialProps: { sessionStatus: 'loading' as const } }
            );

            expect(mockFetchAccountsApi).not.toHaveBeenCalled();

            rerender({ sessionStatus: 'authenticated' as const });

            await waitFor(() => {
                expect(mockFetchAccountsApi).toHaveBeenCalledOnce();
            });

            await waitFor(() => {
                expect(result.current.accounts).toEqual(mockAccountsResponse.accounts);
            });
        });
    });
});
