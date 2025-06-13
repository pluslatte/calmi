import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useConfirmationModal from "./useConfirmationModal";

describe('when handleConfirm is called', () => {
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('success case', () => {
        it('cleans isLoading state', async () => {
            mockOnConfirm.mockResolvedValue(undefined);

            const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

            expect(result.current.isLoading).toBe(false);

            await act(async () => {
                await result.current.handleConfirm();
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('handleConfirm calls onConfirm', async () => {
            mockOnConfirm.mockResolvedValue(undefined);

            const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

            await act(async () => {
                await result.current.handleConfirm();
            });

            expect(mockOnConfirm).toHaveBeenCalledOnce();
        });

        it('handleConfirm closes modal on success', async () => {
            mockOnConfirm.mockResolvedValue(undefined);

            const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

            act(() => {
                result.current.open();
            });

            expect(result.current.opened).toBe(true);

            await act(async () => {
                await result.current.handleConfirm();
            });

            expect(result.current.opened).toBe(false);
        })
    });

    describe('failure case', () => {
        it('handleConfirm keeps modal open on error', async () => {
            const error = new Error('Test error');
            mockOnConfirm.mockRejectedValue(error);

            const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

            act(() => {
                result.current.open();
            });

            expect(result.current.opened).toBe(true);

            await act(async () => {
                try {
                    await result.current.handleConfirm();
                } catch {
                    // expected
                }
            });

            expect(result.current.opened).toBe(true);
        });

        it('handleConfirm resets loading state on error', async () => {
            const error = new Error('Test error');
            mockOnConfirm.mockRejectedValue(error);

            const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

            expect(result.current.isLoading).toBe(false);

            await act(async () => {
                try {
                    await result.current.handleConfirm();
                } catch {
                    // expected
                }
            });

            expect(result.current.isLoading).toBe(false);
        });
    });
})

describe('returned function open', () => {
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('opens modal', () => {
        mockOnConfirm.mockResolvedValue(undefined);
        const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

        expect(result.current.opened).toBe(false);

        act(() => {
            result.current.open();
        });

        expect(result.current.opened).toBe(true);
    });
})