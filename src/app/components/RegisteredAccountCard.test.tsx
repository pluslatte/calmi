import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import RegisteredAccountCard from "./RegisteredAccountCard";
import { mockMisskeyAccount } from "@/tests/fixtures";

// テスト用のMantineProviderでラップするヘルパー関数
const renderWithMantine = (component: React.ReactElement) => {
    return render(
        <MantineProvider>
            {component}
        </MantineProvider>
    );
};

describe("RegisteredAccountCard", () => {
    describe("アカウント情報の表示", () => {
        it("アカウントの基本情報を表示すること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            // 表示名の確認
            expect(screen.getByText("Test User")).toBeInTheDocument();

            // ユーザー名の確認（@付き）
            expect(screen.getByText("@testuser")).toBeInTheDocument();

            // インスタンスURLの確認
            expect(screen.getByText("https://calmi.net")).toBeInTheDocument();

            // アバター画像の確認
            const avatar = screen.getByRole("img");
            expect(avatar).toBeInTheDocument();
        });

        it("アバター画像のsrc属性が正しく設定されること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            const avatar = screen.getByRole("img");
            expect(avatar).toHaveAttribute("src", account.avatarUrl);
        });
    });

    describe("アクティブバッジの表示", () => {
        it("isActiveがtrueの場合、アクティブバッジを表示すること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={true}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            expect(screen.getByText("アクティブ")).toBeInTheDocument();
        });

        it("isActiveがfalseの場合、アクティブバッジを表示しないこと", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            expect(screen.queryByText("アクティブ")).not.toBeInTheDocument();
        });
    });

    describe("削除ボタンの動作", () => {
        it("削除ボタンを表示すること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            const deleteButton = screen.getByRole("button", { name: "削除" });
            expect(deleteButton).toBeInTheDocument();
        });

        it("削除ボタンをクリックするとonDeleteが呼ばれること", async () => {
            const user = userEvent.setup();
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            const deleteButton = screen.getByRole("button", { name: "削除" });
            await user.click(deleteButton);

            expect(mockOnDelete).toHaveBeenCalledTimes(1);
            expect(mockOnDelete).toHaveBeenCalledWith("test-account-1");
        });

        it("isDeletingがtrueの場合、削除ボタンが無効になること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={true}
                />
            );

            const deleteButton = screen.getByRole("button", { name: "削除" });
            expect(deleteButton).toBeDisabled();
        });

        it("isDeletingがtrueの場合、削除ボタンにローディング状態を表示すること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={true}
                />
            );

            const deleteButton = screen.getByRole("button", { name: "削除" });
            // Mantineのローディング状態は data-loading で確認可能
            expect(deleteButton).toHaveAttribute("data-loading", "true");
        });

        it("isDeletingがfalseの場合、削除ボタンが有効であること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            const deleteButton = screen.getByRole("button", { name: "削除" });
            expect(deleteButton).not.toBeDisabled();
        });
    });

    describe("アクセシビリティ", () => {
        it("削除ボタンが適切なaria-labelを持つこと", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            const deleteButton = screen.getByRole("button", { name: "削除" });
            expect(deleteButton).toHaveAccessibleName("削除");
        });

        it("アバター画像が適切なalt属性を持つこと", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;

            renderWithMantine(
                <RegisteredAccountCard
                    account={account}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            const avatar = screen.getByRole("img");
            expect(avatar).toHaveAttribute("alt", expect.stringContaining(""));
        });
    });

    describe("エッジケース", () => {
        it("displayNameが空文字の場合でも表示が崩れないこと", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;
            const accountWithEmptyDisplayName = {
                ...account,
                displayName: "",
            };

            renderWithMantine(
                <RegisteredAccountCard
                    account={accountWithEmptyDisplayName}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            // ユーザー名は表示される
            expect(screen.getByText("@testuser")).toBeInTheDocument();
            // インスタンスURLは表示される
            expect(screen.getByText("https://calmi.net")).toBeInTheDocument();
        });

        it("avatarUrlが空文字の場合でもアバターが表示されること", () => {
            const mockOnDelete = vi.fn();
            const account = mockMisskeyAccount;
            const accountWithEmptyAvatar = {
                ...account,
                avatarUrl: "",
            };

            renderWithMantine(
                <RegisteredAccountCard
                    account={accountWithEmptyAvatar}
                    isActive={false}
                    onDelete={mockOnDelete}
                    isDeleting={false}
                />
            );

            const avatar = screen.getByRole("img");
            expect(avatar).toBeInTheDocument();
        });
    });
});
