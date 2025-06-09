import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider, MantineThemeOverride } from "@mantine/core";
import { Session } from "next-auth";
import React, { ReactElement } from "react";
import { SessionProvider } from "next-auth/react";
import { theme } from "@/lib/mantine-theme";
import { Notifications } from "@mantine/notifications";

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    session?: Session | null;
    sessionStatus?: 'loading' | 'authenticated' | 'unauthenticated';

    theme?: MantineThemeOverride;
    initialNotifications?: any[];
}

export function renderWithProviders(
    ui: ReactElement,
    options: CustomRenderOptions = {},
) {
    const { session = null, ...renderOptions } = options;

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <SessionProvider session={session}>
                <MantineProvider theme={theme} forceColorScheme="dark">
                    <Notifications position="bottom-center" />
                    {children}
                </MantineProvider>
            </SessionProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';