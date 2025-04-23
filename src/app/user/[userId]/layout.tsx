'use client';

import { Box } from "@mantine/core";
import React from "react";
import UserFooter from "@/components/UserFooter";
import AuthCheck from "@/components/AuthCheck";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthCheck>
            <Box pt="md">
                {children}
            </Box>
            <UserFooter />
        </AuthCheck>
    );
}