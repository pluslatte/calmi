import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from "@mantine/core";
import { Session } from "next-auth";
import React, { ReactElement } from "react";
import { SessionProvider } from "next-auth/react";
import { theme } from "@/lib/mantine-theme";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    session?: Session | null;
    sessionStatus?: 'loading' | 'authenticated' | 'unauthenticated';
}

/**
 * useSessionをモックして指定したstatusを返すようにする
 */
export function mockUseSession(
    session: Session | null,
    status: 'loading' | 'authenticated' | 'unauthenticated'
) {
    const mockUseSession = vi.fn(() => ({
        data: session,
        status: status,
    }));

    vi.doMock('next-auth/react', async () => {
        const actual = await vi.importActual('next-auth/react');
        return {
            ...actual,
            useSession: mockUseSession,
        };
    });

    return mockUseSession;
}

/**
 * Renders element inside SessionProvider and MantineProvider  
 * sessionStatusが指定された場合、useSessionをモックします
 * @param ui React element to render
 * @param options renderOptions and next-auth session state
 * @returns React element wrapped with SessionProvider and MantineProvider
 */
export function renderWithProviders(
    ui: ReactElement,
    options: CustomRenderOptions = {},
) {
    const { session = null, sessionStatus, ...renderOptions } = options;

    // sessionStatusが指定された場合、useSessionをモック
    if (sessionStatus) {
        mockUseSession(session, sessionStatus);
    }

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                // テストではリトライを無効化
                retry: false,
            },
        },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <SessionProvider session={session}>
                    <MantineProvider theme={theme} forceColorScheme="dark">
                        <Notifications position="bottom-center" />
                        {children}
                    </MantineProvider>
                </SessionProvider>
            </QueryClientProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';