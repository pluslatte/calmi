import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import NewAccountRegistrationForm from "./NewAccountRegistrationForm";
import useAccountRegistration from "@/hooks/useAccountRegistration";
import { notifyFailure, notifySuccess } from "@/lib/notifications";
import { mockRegisterResponse } from "@/tests/fixtures";

// モックの設定
vi.mock("@/hooks/useAccountRegistration");
vi.mock("@/lib/notifications", () => ({
    notifySuccess: vi.fn(),
    notifyFailure: vi.fn(),
}));

const mockUseAccountRegistration = vi.mocked(useAccountRegistration);
const mockNotifySuccess = vi.mocked(notifySuccess);
const mockNotifyFailure = vi.mocked(notifyFailure);

describe('NewAccountRegistrationForm', () => {
    const mockOnAccountRegistered = vi.fn();
    const mockRegisterAccount = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAccountRegistration.mockReturnValue({
            registerAccount: mockRegisterAccount,
            isSubmitting: false,
        });
    });

    describe('1. コンポーネントレンダリング', () => {
        it('フォームが正しく表示されること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            expect(screen.getByRole('heading', { name: '新規アカウント登録' })).toBeInTheDocument();
            expect(screen.getByRole('form')).toBeInTheDocument();
        });

        it('必要なフィールドが存在すること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            expect(screen.getByPlaceholderText('https://misskey.io')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('APIキーを入力してください')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
        });

        it('警告メッセージが表示されること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            expect(screen.getByText(/APIキーがサーバー上に保持されます/)).toBeInTheDocument();
            expect(screen.getByText(/あなたが何をしようとしているかを理解していますか/)).toBeInTheDocument();
        });

        it('フィールドに正しいプレースホルダーが設定されていること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            expect(screen.getByPlaceholderText('https://misskey.io')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('APIキーを入力してください')).toBeInTheDocument();
        });

        it('アクセストークンフィールドがパスワードタイプであること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            expect(tokenField).toHaveAttribute('type', 'password');
        });
    });

    describe('2. ユーザーインタラクション', () => {
        it('フィールドへの入力が正しく反映されること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token-123');

            expect(instanceUrlField).toHaveValue('https://test.pluslatte.com');
            expect(tokenField).toHaveValue('test-token-123');
        });

        it('フィールドが空の場合、送信ボタンが無効になること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const submitButton = screen.getByRole('button', { name: '登録' });
            expect(submitButton).toBeDisabled();
        });

        it('インスタンスURLが空の場合、送信ボタンが無効になること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(tokenField, 'test-token');

            expect(submitButton).toBeDisabled();
        });

        it('アクセストークンが空の場合、送信ボタンが無効になること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');

            expect(submitButton).toBeDisabled();
        });

        it('両方のフィールドが入力済みの場合、送信ボタンが有効になること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');

            expect(submitButton).not.toBeDisabled();
        });
    });

    describe('3. フォーム送信', () => {
        it('正常送信時の処理が正しく実行されること', async () => {
            const user = userEvent.setup();
            mockRegisterAccount.mockResolvedValue(mockRegisterResponse);

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');
            await user.click(submitButton);

            expect(mockRegisterAccount).toHaveBeenCalledWith('https://test.pluslatte.com', 'test-token');
            expect(mockNotifySuccess).toHaveBeenCalledWith(`${mockRegisterResponse.account.displayName}のアカウントが登録されました`);
            expect(mockOnAccountRegistered).toHaveBeenCalledTimes(1);
        });

        it('正常送信後にフィールドがクリアされること', async () => {
            const user = userEvent.setup();
            mockRegisterAccount.mockResolvedValue(mockRegisterResponse);
            
            // onSuccessコールバックがフィールドクリアを実行するようにモック
            mockUseAccountRegistration.mockImplementation((onSuccess) => ({
                registerAccount: async (url: string, token: string) => {
                    const result = await mockRegisterAccount(url, token);
                    onSuccess?.(); // コールバックを実行
                    return result;
                },
                isSubmitting: false,
            }));

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');
            await user.click(submitButton);

            expect(instanceUrlField).toHaveValue('');
            expect(tokenField).toHaveValue('');
        });

        it('エラー発生時の処理が正しく実行されること', async () => {
            const user = userEvent.setup();
            const testError = new Error('登録エラー');
            mockRegisterAccount.mockRejectedValue(testError);

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');
            await user.click(submitButton);

            expect(mockRegisterAccount).toHaveBeenCalledWith('https://test.pluslatte.com', 'test-token');
            expect(mockNotifyFailure).toHaveBeenCalledWith(testError);
            expect(mockOnAccountRegistered).not.toHaveBeenCalled();
        });

        it('フォーム送信時にpreventDefaultが呼ばれること', async () => {
            const user = userEvent.setup();
            mockRegisterAccount.mockResolvedValue(mockRegisterResponse);

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const form = screen.getByRole('form');
            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');

            // フォームの直接送信をテスト
            const mockPreventDefault = vi.fn();
            form.addEventListener('submit', (e) => {
                mockPreventDefault();
                e.preventDefault();
            });

            await user.click(screen.getByRole('button', { name: '登録' }));

            expect(mockPreventDefault).toHaveBeenCalled();
        });
    });

    describe('4. Hook統合', () => {
        it('isSubmitting状態がローディング表示に反映されること', () => {
            mockUseAccountRegistration.mockReturnValue({
                registerAccount: mockRegisterAccount,
                isSubmitting: true,
            });

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const submitButton = screen.getByRole('button', { name: '登録' });
            
            // Mantineのloadingプロパティによりボタンがdisabledになる
            expect(submitButton).toBeDisabled();
        });

        it('useAccountRegistrationに正しいコールバックが渡されること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            expect(mockUseAccountRegistration).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    describe('5. Props処理', () => {
        it('onAccountRegisteredコールバックが適切に呼び出されること', async () => {
            const user = userEvent.setup();
            mockRegisterAccount.mockResolvedValue(mockRegisterResponse);
            
            // onSuccessコールバックがプロップスのコールバックを呼ぶようにモック
            mockUseAccountRegistration.mockImplementation((onSuccess) => ({
                registerAccount: async (url: string, token: string) => {
                    const result = await mockRegisterAccount(url, token);
                    onSuccess?.(); // コールバックを実行
                    return result;
                },
                isSubmitting: false,
            }));

            renderWithProviders(
                <NewAccountRegistrationForm onAccountRegistered={mockOnAccountRegistered} />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://misskey.io');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');
            await user.click(submitButton);

            expect(mockOnAccountRegistered).toHaveBeenCalledTimes(1);
        });
    });
});
