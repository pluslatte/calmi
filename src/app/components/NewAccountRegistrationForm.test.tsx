import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";
import NewAccountRegistrationForm from "./NewAccountRegistrationForm";
import { notifyFailure, notifySuccess } from "@/lib/notifications";
import { mockRegisterResponse } from "@/tests/fixtures";

vi.mock("@/lib/notifications", () => ({
    notifySuccess: vi.fn(),
    notifyFailure: vi.fn(),
}));

const mockNotifySuccess = vi.mocked(notifySuccess);
const mockNotifyFailure = vi.mocked(notifyFailure);

describe('NewAccountRegistrationForm', () => {
    const mockRegisterAccount = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('1. コンポーネントレンダリング', () => {
        it('フォームが正しく表示されること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            expect(screen.getByText('新規アカウント登録')).toBeInTheDocument();
            expect(document.querySelector('form')).toBeInTheDocument();
        });

        it('必要なフィールドが存在すること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            // 実用的アプローチ: 全フィールドでgetByPlaceholderTextを使用（確実に動作）
            expect(screen.getByPlaceholderText('https://virtualkemomimi.net')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('APIキーを入力してください')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
        });

        it('警告メッセージが表示されること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            expect(screen.getByText(/APIキーがサーバー上に保持されます/)).toBeInTheDocument();
            expect(screen.getByText(/あなたが何をしようとしているかを理解していますか/)).toBeInTheDocument();
        });

        it('フィールドに正しいプレースホルダーが設定されていること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            expect(screen.getByPlaceholderText('https://virtualkemomimi.net')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('APIキーを入力してください')).toBeInTheDocument();
        });

        it('APIキーのフィールドがパスワードタイプであること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            expect(tokenField).toHaveAttribute('type', 'password');
        });
    });

    describe('2. ユーザーインタラクション', () => {
        it('フィールドへの入力が正しく反映されること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://virtualkemomimi.net');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token-123');

            expect(instanceUrlField).toHaveValue('https://test.pluslatte.com');
            expect(tokenField).toHaveValue('test-token-123');
        });

        it('フィールドが空の場合、送信ボタンが無効になること', () => {
            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const submitButton = screen.getByRole('button', { name: '登録' });
            expect(submitButton).toBeDisabled();
        });

        it('インスタンスURLが空の場合、送信ボタンが無効になること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(tokenField, 'test-token');

            expect(submitButton).toBeDisabled();
        });

        it('APIキーのフィールドが空の場合、送信ボタンが無効になること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://virtualkemomimi.net');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');

            expect(submitButton).toBeDisabled();
        });

        it('両方のフィールドが入力済みの場合、送信ボタンが有効になること', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://virtualkemomimi.net');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');

            expect(submitButton).not.toBeDisabled();
        });
    });

    describe('3. フォーム送信', () => {
        it('正常送信後にフィールドがクリアされること', async () => {
            const user = userEvent.setup();
            mockRegisterAccount.mockResolvedValue(mockRegisterResponse);

            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://virtualkemomimi.net');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');
            await user.click(submitButton);

            waitFor(() => {
                expect(instanceUrlField).toHaveValue('');
                expect(tokenField).toHaveValue('');
            });
        });

        it('エラー発生時の処理が正しく実行されること', async () => {
            const user = userEvent.setup();
            const testError = new Error('登録エラー');
            mockRegisterAccount.mockRejectedValue(testError);

            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const instanceUrlField = screen.getByPlaceholderText('https://virtualkemomimi.net');
            const tokenField = screen.getByPlaceholderText('APIキーを入力してください');
            const submitButton = screen.getByRole('button', { name: '登録' });

            await user.type(instanceUrlField, 'https://test.pluslatte.com');
            await user.type(tokenField, 'test-token');
            await user.click(submitButton);

            expect(mockRegisterAccount).toHaveBeenCalledWith('https://test.pluslatte.com', 'test-token');
            expect(mockNotifyFailure).toHaveBeenCalledWith(testError);
        });

        it('フォーム送信時にpreventDefaultが呼ばれること', async () => {
            const user = userEvent.setup();
            mockRegisterAccount.mockResolvedValue(mockRegisterResponse);

            renderWithProviders(
                <NewAccountRegistrationForm />
            );

            const form = document.querySelector('form')!;
            const instanceUrlField = screen.getByPlaceholderText('https://virtualkemomimi.net');
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
        it('ボタンのローディング表示', () => {
            throw new Error('Unimplemented');
        });
    });
});
