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

    it('opened が true の場合、モーダルを表示すること', () => {
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

    it('opened が false の場合、モーダルを表示しないこと', () => {
        renderWithProviders(
            <DeleteConfirmationModal
                opened={false}
                close={mockClose}
                onclick={mockOnClick}
            />
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('キャンセルと削除ボタンを表示すること', () => {
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

    it('キャンセルボタンをクリックした場合、close関数が呼ばれること', async () => {
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

    it('削除ボタンをクリックした場合、onclick関数が呼ばれること', async () => {
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

    it('loading が true の場合、削除ボタンが無効になること', () => {
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

    it('loading が false の場合、削除ボタンが無効にならないこと', () => {
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
