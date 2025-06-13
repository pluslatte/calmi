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
    });
})