import { describe, expect, test } from "vitest";
import { renderWithProviders, screen } from "./utils/test-utils";

function TestComponent() {
    return <div>Hello Test World!</div>;
}

describe('test-utils', () => {
    test('renderWithProviders is ok', () => {
        renderWithProviders(<TestComponent />);
        expect(screen.getByText('Hello Test World!')).toBeInTheDocument();
    });

    test('Cover session', () => {
        const mockSession = {
            user: { name: 'Test User', email: 'test@example.com' },
            expires: '2024-12-31'
        };

        renderWithProviders(<TestComponent />, {
            session: mockSession
        });

        expect(screen.getByText('Hello Test World!')).toBeInTheDocument();
    });
});