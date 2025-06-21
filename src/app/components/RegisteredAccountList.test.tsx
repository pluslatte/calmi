import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import RegisteredAccountList from "./RegisteredAccountList";
import { QueryClient } from "@tanstack/react-query";
import { mockAccountsResponse, mockMisskeyAccounts } from "@/tests/fixtures/data/accounts";

// vi.mockは関数を直接定義する必要がある
vi.mock("@/lib/misskey-api/accounts", () => ({
    fetchAccountsApi: vi.fn(),
    deleteAccountApi: vi.fn(),
}));

vi.mock("@/lib/notifications", () => ({
    notifySuccess: vi.fn(),
}));

// モック関数を取得
import { fetchAccountsApi, deleteAccountApi } from "@/lib/misskey-api/accounts";
import { notifySuccess } from "@/lib/notifications";

const mockFetchAccountsApi = vi.mocked(fetchAccountsApi);
const mockDeleteAccountApi = vi.mocked(deleteAccountApi);
const mockNotifySuccess = vi.mocked(notifySuccess);

describe("RegisteredAccountList", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });

        // モックをリセット
        mockFetchAccountsApi.mockClear();
        mockDeleteAccountApi.mockClear();
        mockNotifySuccess.mockClear();
    });

    describe("データ取得状態の表示", () => {
        it("ローディング中はローダーを表示すること", async () => {
            // ローディング状態をシミュレート
            mockFetchAccountsApi.mockImplementation(() => new Promise(() => {}));

            const { container } = renderWithProviders(<RegisteredAccountList />);
            
            // ローディング中は、エラーメッセージやアカウント一覧が表示されないことを確認
            expect(screen.queryByText("アカウント情報の取得に失敗しました")).not.toBeInTheDocument();
            expect(screen.queryByText("登録済みアカウント")).not.toBeInTheDocument();
            expect(screen.queryByText("アカウントが登録されていません")).not.toBeInTheDocument();
            
            // ローダーが存在することを確認（複数の方法で試す）
            const hasLoader = container.querySelector('.mantine-Loader-root') ||
                             container.querySelector('[aria-label="Loading"]') ||
                             container.querySelector('svg') ||
                             screen.queryByTestId('loader');
            
            expect(hasLoader).toBeTruthy();
        });

        it("エラー発生時はエラーメッセージを表示すること", async () => {
            // エラー状態をシミュレート
            mockFetchAccountsApi.mockRejectedValue(new Error("Network error"));

            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("アカウント情報の取得に失敗しました")).toBeInTheDocument();
            });
        });

        it("アカウントが0件の場合は空状態メッセージを表示すること", async () => {
            mockFetchAccountsApi.mockResolvedValue({
                accounts: [],
                activeAccountId: null,
            });

            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("アカウントが登録されていません。下記のフォームから登録してください。")).toBeInTheDocument();
            });
        });
    });

    describe("アカウント一覧の表示", () => {
        beforeEach(() => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);
        });

        it("タイトルを表示すること", async () => {
            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: "登録済みアカウント" })).toBeInTheDocument();
            });
        });

        it("すべてのアカウント情報を表示すること", async () => {
            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                mockMisskeyAccounts.forEach((account) => {
                    expect(screen.getByText(account.displayName)).toBeInTheDocument();
                    expect(screen.getByText(`@${account.username}`)).toBeInTheDocument();
                    expect(screen.getByText(account.instanceUrl)).toBeInTheDocument();
                });
            });
        });

        it("アクティブアカウントにはバッジを表示すること", async () => {
            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("アクティブ")).toBeInTheDocument();
            });
        });

        it("各アカウントに削除ボタンを表示すること", async () => {
            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                const deleteButtons = screen.getAllByRole("button", { name: "削除" });
                expect(deleteButtons).toHaveLength(mockMisskeyAccounts.length);
            });
        });

        it("アバター画像を表示すること", async () => {
            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                mockMisskeyAccounts.forEach((account) => {
                    const avatar = screen.getByRole("img", { name: "" });
                    expect(avatar).toBeInTheDocument();
                });
            });
        });
    });

    describe("削除機能", () => {
        beforeEach(() => {
            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);
            mockDeleteAccountApi.mockResolvedValue({});
        });

        it("削除ボタンをクリックすると確認モーダルを開くこと", async () => {
            const user = userEvent.setup();

            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("Test User")).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole("button", { name: "削除" });
            await user.click(deleteButtons[0]);

            expect(screen.getByRole("dialog")).toBeInTheDocument();
            expect(screen.getByText("アカウント削除の確認")).toBeInTheDocument();
        });

        it("確認モーダルで削除を実行すると、APIが呼ばれて成功通知が表示されること", async () => {
            const user = userEvent.setup();

            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("Test User")).toBeInTheDocument();
            });

            // 削除ボタンをクリック
            const deleteButtons = screen.getAllByRole("button", { name: "削除" });
            await user.click(deleteButtons[0]);

            // 確認モーダルで削除実行
            const confirmDeleteButton = screen.getByRole("button", { name: "削除" });
            await user.click(confirmDeleteButton);

            await waitFor(() => {
                expect(mockDeleteAccountApi).toHaveBeenCalledWith("test-account-1");
                expect(mockNotifySuccess).toHaveBeenCalledWith("アカウントを削除しました");
            });
        });

        it("確認モーダルでキャンセルすると、削除処理が実行されないこと", async () => {
            const user = userEvent.setup();

            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("Test User")).toBeInTheDocument();
            });

            // 削除ボタンをクリック
            const deleteButtons = screen.getAllByRole("button", { name: "削除" });
            await user.click(deleteButtons[0]);

            // 確認モーダルでキャンセル
            const cancelButton = screen.getByRole("button", { name: "キャンセル" });
            await user.click(cancelButton);

            expect(mockDeleteAccountApi).not.toHaveBeenCalled();
            expect(mockNotifySuccess).not.toHaveBeenCalled();
        });

        it("削除処理中は削除ボタンが無効になること", async () => {
            const user = userEvent.setup();

            // 削除処理を遅延させる
            mockDeleteAccountApi.mockImplementation(() => new Promise((resolve) => {
                setTimeout(resolve, 100);
            }));

            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("Test User")).toBeInTheDocument();
            });

            // 削除ボタンをクリック
            const deleteButtons = screen.getAllByRole("button", { name: "削除" });
            await user.click(deleteButtons[0]);

            // 確認モーダルで削除実行
            const confirmDeleteButton = screen.getByRole("button", { name: "削除" });
            await user.click(confirmDeleteButton);

            // 削除処理中は削除ボタンが無効
            expect(deleteButtons[0]).toBeDisabled();
        });
    });

    describe("データの再取得", () => {
        it("削除成功後にアカウント一覧を再取得すること", async () => {
            const user = userEvent.setup();

            mockFetchAccountsApi.mockResolvedValue(mockAccountsResponse);
            mockDeleteAccountApi.mockResolvedValue({});

            renderWithProviders(<RegisteredAccountList />);

            await waitFor(() => {
                expect(screen.getByText("Test User")).toBeInTheDocument();
            });

            // fetchAccountsApiの呼び出し回数をリセット
            mockFetchAccountsApi.mockClear();

            // 削除処理を実行
            const deleteButtons = screen.getAllByRole("button", { name: "削除" });
            await user.click(deleteButtons[0]);

            const confirmDeleteButton = screen.getByRole("button", { name: "削除" });
            await user.click(confirmDeleteButton);

            await waitFor(() => {
                // React Queryのinvalidateによって再取得される
                expect(mockFetchAccountsApi).toHaveBeenCalled();
            });
        });
    });
});
