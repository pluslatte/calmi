'use client';

import React from "react";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { theme } from "@/lib/mantine-theme";
import { Notifications } from "@mantine/notifications";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ColorSchemeScript defaultColorScheme="light" />
            <MantineProvider theme={theme} defaultColorScheme="light">
                <Notifications position="bottom-center" />
                {children}
            </MantineProvider>
        </>
    );
}