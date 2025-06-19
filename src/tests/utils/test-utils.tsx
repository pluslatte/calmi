import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from "@mantine/core";
import { Session } from "next-auth";
import React, { ReactElement } from "react";
import { SessionProvider } from "next-auth/react";
import { theme } from "@/lib/mantine-theme";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    session?: Session | null;
}

/**
 * Renders element inside SessionProvider and MantineProvider  
 * NOTE: Maybe you want to use next-auth mock in /src/__tests__/__mocks__
 * @param ui React element to render
 * @param options renderOptions and next-auth session state
 * @returns React element wrapped with SessionProvider and MantineProvider
 */
export function renderWithProviders(
    ui: ReactElement,
    options: CustomRenderOptions = {},
) {
    const { session = null, ...renderOptions } = options;
    const queryClient = new QueryClient();

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