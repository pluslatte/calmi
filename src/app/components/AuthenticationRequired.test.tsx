import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";
import AuthenticationRequired from "./AuthenticationRequired";

const TestChildren = () => <div>Test Children Content</div>;

describe('AuthenticationRequired', () => {

    it('認証状態が loading の場合、認証確認メッセージを表示すること', () => {
        renderWithProviders(
            <AuthenticationRequired status="loading">
                <TestChildren />
            </AuthenticationRequired>
        );

        expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
        expect(screen.queryByText('Test Children Content')).not.toBeInTheDocument();
    });

    it('未認証の場合、アクセス拒否メッセージとホームボタンを表示すること', () => {
        renderWithProviders(
            <AuthenticationRequired status="unauthenticated">
                <TestChildren />
            </AuthenticationRequired>
        );

        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'ホームに戻る' })).toBeInTheDocument();
        expect(screen.queryByText('Test Children Content')).not.toBeInTheDocument();
    });

    it('認証済みの場合、子コンポーネントを表示すること', () => {
        renderWithProviders(
            <AuthenticationRequired status="authenticated">
                <TestChildren />
            </AuthenticationRequired>
        );

        expect(screen.getByText('Test Children Content')).toBeInTheDocument();
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'ホームに戻る' })).not.toBeInTheDocument();
    });

    it('ホームボタンのリンクが正しいhrefを持つこと', () => {
        renderWithProviders(
            <AuthenticationRequired status="unauthenticated">
                <TestChildren />
            </AuthenticationRequired>
        );

        const homeButton = screen.getByRole('link', { name: 'ホームに戻る' });
        expect(homeButton.closest('a')).toHaveAttribute('href', '/');
    });
});
