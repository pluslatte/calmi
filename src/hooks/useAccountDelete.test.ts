import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAccountDelete from "./useAccountDelete";
import { deleteAccountApi } from "@/lib/api/accounts";

// APIをモック化
vi.mock("@/lib/api/accounts", () => ({
    deleteAccountApi: vi.fn(),
}));

const mockDeleteAccountApi = vi.mocked(deleteAccountApi);

describe('when deleteAccount is called', () => {
    const mockOnAccountDeleted = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('success case', () => {
        it('isDeleting state is properly cleaned', async () => {
            mockDeleteAccountApi.mockResolvedValue(undefined);

            const { result } = renderHook(() => useAccountDelete(mockOnAccountDeleted));

            expect(result.current.isDeleting).toBe(false);

            await act(async () => {
                await result.current.deleteAccount('test-account-id');
            });

            expect(result.current.isDeleting).toBe(false);
        });

        it('onAccountDeleted is called once on success', async () => {
            mockDeleteAccountApi.mockResolvedValue(undefined);

            const { result } = renderHook(() => useAccountDelete(mockOnAccountDeleted));

            await act(async () => {
                await result.current.deleteAccount('test-account-id');
            });

            expect(mockOnAccountDeleted).toHaveBeenCalledOnce();
            expect(mockDeleteAccountApi).toHaveBeenCalledWith('test-account-id');
        });
    })

    describe('failure case', () => {
        it('isDeleting is properly updated', async () => {
            const mockError = new Error('API Error');
            mockDeleteAccountApi.mockRejectedValue(mockError);

            const { result } = renderHook(() => useAccountDelete(mockOnAccountDeleted));

            expect(result.current.isDeleting).toBe(false);

            await expect(
                act(async () => {
                    await result.current.deleteAccount('test-account-id');
                })
            ).rejects.toThrow('API Error');

            expect(result.current.isDeleting).toBe(false);
        });

        it('onAccountDeleted is NOT called', async () => {
            const mockError = new Error('API Error');
            mockDeleteAccountApi.mockRejectedValue(mockError);

            const { result } = renderHook(() => useAccountDelete(mockOnAccountDeleted));

            await expect(
                act(async () => {
                    await result.current.deleteAccount('test-account-id');
                })
            ).rejects.toThrow('API Error');

            expect(mockOnAccountDeleted).not.toHaveBeenCalled();
        });
    });
});