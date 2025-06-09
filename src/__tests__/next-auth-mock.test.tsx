import { resetMockSession, setMockSession } from "./__mocks__/next-auth";

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

describe('next-auth mock', () => {
    beforeEach(() => {
        resetMockSession();
    });

    test('unauthenticated', () => {
        setMockSession({
            status: 'unauthenticated',
            data: null,
        });

        renderWithProviders(<AuthTestComponent />);
        expect(screen.getByText('Please login')).toBeInTheDocument();
    });

    test('authenticated', () => {
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

    test('loading state', () => {
        setMockSession({
            status: 'loading',
            data: null
        });

        renderWithProviders(<AuthTestComponent />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('signOut is called on button click', async () => {
        const { mockSignOut } = await import('./__mocks__/next-auth');

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