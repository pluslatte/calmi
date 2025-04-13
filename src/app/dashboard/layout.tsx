'use client';

import { api } from "misskey-js";
import { useRouter } from "next/navigation";
import React from "react";
import { MisskeyApiClientProvider } from "../MisskeyApiClientContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const token = localStorage.getItem('misskey_token');
    if (token == null) {
        alert('no misskeyApiToken detected');
        router.push('/login');
    }

    const misskeyApiClient = new api.APIClient({
        origin: 'https://virtualkemomimi.net',
        credential: token,
    });

    return (
        <MisskeyApiClientProvider apiClient={misskeyApiClient}>
            {children}
        </MisskeyApiClientProvider>
    );
}