import { registerAccountApi } from "@/lib/misskey-api/accounts";
import { mockRegisterResponse } from "@/tests/fixtures";
import { renderHook, act } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import useAccountRegistration from "./useAccountRegistration";

vi.mock("@/lib/misskey-api/accounts", () => ({
    registerAccountApi: vi.fn(),
}));

const mockRegisterAccountApi = vi.mocked(registerAccountApi);

describe('registerAccount が呼ばれた場合', () => {
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('成功ケース', () => {
        it('isSubmitting 状態をクリアすること', async () => {
            mockRegisterAccountApi.mockResolvedValue(mockRegisterResponse);

            const { result } = renderHook(() => useAccountRegistration(mockOnSuccess));

            expect(result.current.isSubmitting).toBe(false);

            await act(async () => {
                await result.current.registerAccount(
                    'test-instance-url',
                    'test-token',
                );
            });

            expect(result.current.isSubmitting).toBe(false);
        });

        it('成功時に onSuccess を一度呼ぶこと', async () => {
            mockRegisterAccountApi.mockResolvedValue(mockRegisterResponse);

            const { result } = renderHook(() => useAccountRegistration(mockOnSuccess));

            await act(async () => {
                await result.current.registerAccount(
                    'test-instance-url',
                    'test-token',
                );
            })

            expect(mockOnSuccess).toHaveBeenCalledOnce();
            expect(mockRegisterAccountApi).toHaveBeenCalledWith(
                'test-instance-url',
                'test-token',
            );
        });
    });

    describe('失敗ケース', () => {
        it('isSubmitting 状態をクリアすること', async () => {
            const mockError = new Error('API Error');
            mockRegisterAccountApi.mockRejectedValue(mockError);

            const { result } = renderHook(() => useAccountRegistration(mockOnSuccess));

            expect(result.current.isSubmitting).toBe(false);

            await expect(
                act(async () => {
                    await result.current.registerAccount(
                        'test-instance-url',
                        'test-token',
                    );
                })
            ).rejects.toThrow('API Error');

            expect(result.current.isSubmitting).toBe(false);
        });

        it('onSuccess を呼ばないこと', async () => {
            const mockError = new Error('API Error');
            mockRegisterAccountApi.mockRejectedValue(mockError);

            const { result } = renderHook(() => useAccountRegistration(mockOnSuccess));

            await expect(
                act(async () => {
                    await result.current.registerAccount(
                        'test-instance-url',
                        'test-token',
                    );
                })
            ).rejects.toThrow('API Error');

            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });
});