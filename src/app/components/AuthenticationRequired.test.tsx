import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";
import AuthenticationRequired from "./AuthenticationRequired";

const TestChildren = () => <div>Test Children Content</div>;

describe('AuthenticationRequired', () => {

    it('should display authentication message when status is loading', () => {
        renderWithProviders(
            <AuthenticationRequired status="loading">
                <TestChildren />
            </AuthenticationRequired>
        );

        expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
        expect(screen.queryByText('Test Children Content')).not.toBeInTheDocument();
    });

    it('should display access denied message and home button when unauthenticated', () => {
        renderWithProviders(
            <AuthenticationRequired status="unauthenticated">
                <TestChildren />
            </AuthenticationRequired>
        );

        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'ホームに戻る' })).toBeInTheDocument();
        expect(screen.queryByText('Test Children Content')).not.toBeInTheDocument();
    });

    it('should display children when authenticated', () => {
        renderWithProviders(
            <AuthenticationRequired status="authenticated">
                <TestChildren />
            </AuthenticationRequired>
        );

        expect(screen.getByText('Test Children Content')).toBeInTheDocument();
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'ホームに戻る' })).not.toBeInTheDocument();
    });

    it('should have correct link href for home button', () => {
        renderWithProviders(
            <AuthenticationRequired status="unauthenticated">
                <TestChildren />
            </AuthenticationRequired>
        );

        const homeButton = screen.getByRole('link', { name: 'ホームに戻る' });
        expect(homeButton.closest('a')).toHaveAttribute('href', '/');
    });
});
