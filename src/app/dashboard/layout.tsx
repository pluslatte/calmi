'use client';

import React, { } from "react";
import UserFooter from "@/components/UserFooter";
import AuthCheck from "@/components/AuthCheck";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthCheck>
            {children}
            <UserFooter />
        </AuthCheck>
    );
}