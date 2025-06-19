"use client";
import { theme } from "@/lib/mantine-theme";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import * as React from "react";

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const Providers = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <MantineProvider theme={theme} forceColorScheme="dark">
                    <Notifications position="bottom-center" />
                    {children}
                    <ReactQueryDevtools />
                </MantineProvider>
            </SessionProvider>
        </QueryClientProvider>
    )
}

export default Providers;