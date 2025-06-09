import { describe, expect, test } from "vitest";
import { renderWithProviders, screen } from "./utils/test-utils";
import { useSession } from "next-auth/react";
import { Button } from "@mantine/core";

function TestComponent() {
    return <div>Hello Test World!</div>;
}

function SessionTestComponent() {
    const { data: session, status } = useSession();

    if (status === 'loading') return <div>Loading...</div>;
    if (status === 'unauthenticated') return <div>Not authenticated</div>;

    return <div>Hello {session?.user?.name}</div>;
}

function MantineTestComponent() {
    return <Button>Test Button</Button>;
}

describe('test-utils renderProvider', () => {

    test('simply render', () => {
        renderWithProviders(<TestComponent />);
        expect(screen.getByText('Hello Test World!')).toBeInTheDocument();
    });

    describe('SessionProvider', () => {

        test('authenticated', () => {
            const mockSession = {
                user: { name: 'Test User', email: 'test@example.com' },
                expires: '2024-12-31'
            };

            renderWithProviders(<SessionTestComponent />, {
                session: mockSession
            });

            expect(screen.getByText('Hello Test User')).toBeInTheDocument();
        });

        test('unauthenticated', () => {
            renderWithProviders(<SessionTestComponent />, {
                session: null
            });

            expect(screen.getByText('Not authenticated')).toBeInTheDocument();
        });
    });

    describe('MantineProvider', () => {
        test('render a button', () => {
            renderWithProviders(<MantineTestComponent />);

            expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
        })
    })
});