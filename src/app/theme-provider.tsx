'use client';

import React from "react";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/lib/mantine-theme";
import { Notifications } from "@mantine/notifications";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <MantineProvider theme={theme} forceColorScheme="dark">
                <Notifications position="bottom-center" />
                {children}
            </MantineProvider>
        </>
    );
}