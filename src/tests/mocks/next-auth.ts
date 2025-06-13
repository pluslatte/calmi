import { Session } from "next-auth"
import React from "react";
import { vi } from "vitest";

let mockSessionData: {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
} = {
    data: null,
    status: 'unauthenticated',
};

export const mockUseSession = vi.fn(() => mockSessionData);
export const mockSignOut = vi.fn();

/**
 * Set mock session state of next-auth
 * @param session next-auth session state
 */
export function setMockSession(session: {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
}) {
    mockSessionData = session;
    mockUseSession.mockReturnValue(session);
}

/**
 * Reset mock session state of next-auth
 */
export function resetMockSession() {
    mockSessionData = { data: null, status: 'unauthenticated' };
    mockUseSession.mockClear();
    mockSignOut.mockClear();
}

vi.mock('next-auth/react', () => ({
    useSession: mockUseSession,
    signOut: mockSignOut,
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));