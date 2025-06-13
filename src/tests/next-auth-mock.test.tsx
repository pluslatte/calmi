import { resetMockSession, setMockSession } from "./mocks/next-auth";

import { Button } from "@mantine/core";
import { signOut, useSession } from "next-auth/react";
import { beforeEach, describe, expect, test } from "vitest";
import { renderWithProviders, screen } from "./utils/test-utils";

function AuthTestComponent() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return <div>Please login</div>;
    }

    return (
        <div>
            <div>Welcome {session?.user?.name}</div>
            <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
    );
}

describe('next-auth モック', () => {
    beforeEach(() => {
        resetMockSession();
    });

    test('認証されていない状態', () => {
        setMockSession({
            status: 'unauthenticated',
            data: null,
        });

        renderWithProviders(<AuthTestComponent />);
        expect(screen.getByText('Please login')).toBeInTheDocument();
    });

    test('認証された状態', () => {
        setMockSession({
            status: 'authenticated',
            data: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                },
                expires: '2024-12-31'
            }
        });

        renderWithProviders(<AuthTestComponent />);
        expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    });

    test('ローディング状態', () => {
        setMockSession({
            status: 'loading',
            data: null
        });

        renderWithProviders(<AuthTestComponent />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('ボタンクリック時に signOut が呼ばれる', async () => {
        const { mockSignOut } = await import('./mocks/next-auth');

        setMockSession({
            status: 'authenticated',
            data: {
                user: { name: 'Test User', email: 'test@example.com' },
                expires: '2024-12-31',
            },
        });

        renderWithProviders(<AuthTestComponent />);

        const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
        signOutButton.click();

        expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
});