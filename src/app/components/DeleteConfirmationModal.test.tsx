import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

describe('DeleteConfirmationModal', () => {
    const mockClose = vi.fn();
    const mockOnClick = vi.fn();

    beforeEach(() => {
        mockClose.mockClear();
        mockOnClick.mockClear();
    });

    it('should display modal when opened is true', () => {
        renderWithProviders(
            <DeleteConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('アカウント削除の確認')).toBeInTheDocument();
        expect(screen.getByText('このアカウントを削除してもよろしいですか？この操作は取り消せません。')).toBeInTheDocument();
    });

    it('should not display modal when opened is false', () => {
        renderWithProviders(
            <DeleteConfirmationModal
                opened={false}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display cancel and delete buttons', () => {
        renderWithProviders(
            <DeleteConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });

    it('should call close function when cancel button is clicked', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <DeleteConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
        await user.click(cancelButton);

        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should call onclick function when delete button is clicked', async () => {
        const user = userEvent.setup();

        renderWithProviders(
            <DeleteConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        const deleteButton = screen.getByRole('button', { name: '削除' });
        await user.click(deleteButton);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should disable delete button when loading is true', () => {
        renderWithProviders(
            <DeleteConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
                loading={true}
            />
        );

        const deleteButton = screen.getByRole('button', { name: '削除' });

        expect(deleteButton).toBeDisabled();
    });

    it('should not disable delete button when loading is false', () => {
        renderWithProviders(
            <DeleteConfirmationModal
                opened={true}
                close={mockClose}
                onclick={mockOnClick}
                loading={false}
            />
        );

        const deleteButton = screen.getByRole('button', { name: '削除' });

        expect(deleteButton).not.toBeDisabled();
    });
});
