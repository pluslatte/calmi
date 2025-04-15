'use client';

import { useRouter } from "next/navigation";
import React from "react";
import { MisskeyProvider } from "@/contexts/MisskeyContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // トークンを取得（クライアントサイドでのみ実行）
    const token = typeof window !== 'undefined' ? localStorage.getItem('misskey_token') : null;

    return (
        <MisskeyProvider>
            {children}
        </MisskeyProvider>
    );
}