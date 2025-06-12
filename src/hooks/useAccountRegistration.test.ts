import { registerAccountApi } from "@/lib/api/accounts";
import { mockRegisterResponse } from "@/tests/fixtures";
import { renderHook, act } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import useAccountRegistration from "./useAccountRegistration";

vi.mock("@/lib/api/accounts", () => ({
    registerAccountApi: vi.fn(),
}));

const mockRegisterAccountApi = vi.mocked(registerAccountApi);

describe('when registerAccount is called', () => {
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('success case', () => {
        it('isSubmitting state is properly cleaned', async () => {
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

        it('onSuccess is called once on success', async () => {
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

    describe('failure case', () => {
        it('isSubmitting state is properly cleaned', async () => {
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
    });
});