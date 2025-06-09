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

export function setMockSession(session: {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
}) {
    mockSessionData = session;
    mockUseSession.mockReturnValue(session);
}

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