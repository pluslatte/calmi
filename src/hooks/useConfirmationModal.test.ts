import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useConfirmationModal from "./useConfirmationModal";

describe('handleConfirm が呼ばれた場合', () => {
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('成功ケース', () => {
        it('isLoading 状態をクリアすること', async () => {
            mockOnConfirm.mockResolvedValue(undefined);

            const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

            expect(result.current.isLoading).toBe(false);

            await act(async () => {
                await result.current.handleConfirm();
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('handleConfirm が onConfirm を呼ぶこと', async () => {
            mockOnConfirm.mockResolvedValue(undefined);

            const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

            await act(async () => {
                await result.current.handleConfirm();
            });

            expect(mockOnConfirm).toHaveBeenCalledOnce();
        });

        it('成功時に handleConfirm がモーダルを閉じること', async () => {
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

    describe('失敗ケース', () => {
        it('エラー時に handleConfirm がモーダルを開いたまま保つこと', async () => {
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

        it('エラー時に handleConfirm がローディング状態をリセットすること', async () => {
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

describe('返された open 関数', () => {
    const mockOnConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('モーダルを開くこと', () => {
        mockOnConfirm.mockResolvedValue(undefined);
        const { result } = renderHook(() => useConfirmationModal(mockOnConfirm));

        expect(result.current.opened).toBe(false);

        act(() => {
            result.current.open();
        });

        expect(result.current.opened).toBe(true);
    });
})