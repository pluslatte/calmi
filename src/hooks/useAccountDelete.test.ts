import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAccountDelete from "./useAccountDelete";
import { deleteAccountApi } from "@/lib/misskey-api/accounts";

// APIをモック化
vi.mock("@/lib/misskey-api/accounts", () => ({
    deleteAccountApi: vi.fn(),
}));

const mockDeleteAccountApi = vi.mocked(deleteAccountApi);

describe('deleteAccount が呼ばれた場合', () => {
    const mockOnAccountDeleted = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('成功ケース', () => {
        it('isDeleting 状態をクリアすること', async () => {
            mockDeleteAccountApi.mockResolvedValue(undefined);

            const { result } = renderHook(() => useAccountDelete(mockOnAccountDeleted));

            expect(result.current.isDeleting).toBe(false);

            await act(async () => {
                await result.current.deleteAccount('test-account-id');
            });

            expect(result.current.isDeleting).toBe(false);
        });

        it('成功時に onAccountDeleted を一度呼ぶこと', async () => {
            mockDeleteAccountApi.mockResolvedValue(undefined);

            const { result } = renderHook(() => useAccountDelete(mockOnAccountDeleted));

            await act(async () => {
                await result.current.deleteAccount('test-account-id');
            });

            expect(mockOnAccountDeleted).toHaveBeenCalledOnce();
            expect(mockDeleteAccountApi).toHaveBeenCalledWith('test-account-id');
        });
    })

    describe('失敗ケース', () => {
        it('isDeleting 状態をクリアすること', async () => {
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

        it('onAccountDeleted を呼ばないこと', async () => {
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