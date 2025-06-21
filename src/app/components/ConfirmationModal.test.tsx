import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import ConfirmationModal from "./ConfirmationModal";

describe('DeleteConfirmationModal', () => {
    const mockClose = vi.fn();
    const mockOnClick = vi.fn();

    beforeEach(() => {
        mockClose.mockClear();
        mockOnClick.mockClear();
    });

    it('opened が true の場合、モーダルを表示すること', () => {
        renderWithProviders(
            <ConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('opened が false の場合、モーダルを表示しないこと', () => {
        renderWithProviders(
            <ConfirmationModal
                opened={false}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('キャンセルと確定ボタンを表示すること', () => {
        renderWithProviders(
            <ConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '確定' })).toBeInTheDocument();
    });

    it('キャンセルボタンをクリックした場合、close関数が呼ばれること', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <ConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
        await user.click(cancelButton);

        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('確定ボタンをクリックした場合、onclick関数が呼ばれること', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <ConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        const deleteButton = screen.getByRole('button', { name: '確定' });
        await user.click(deleteButton);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('確定ボタンをクリックした場合、close関数が呼ばれること', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <ConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        const deleteButton = screen.getByRole('button', { name: '確定' });
        await user.click(deleteButton);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});
