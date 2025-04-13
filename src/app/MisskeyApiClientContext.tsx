'use client';

import { api } from "misskey-js";
import React, { createContext, useContext } from "react";

export const MisskeyApiClientContext = createContext<api.APIClient | null>(null);

export function useApiClient(): api.APIClient {
    const context = useContext(MisskeyApiClientContext);

    if (!context) {
        throw new Error('useApiClient must be used within an ApiClientProvider');
    }

    return context;
}

export function MisskeyApiClientProvider({ apiClient, children }: { apiClient: api.APIClient; children: React.ReactNode }) {
    return (
        <MisskeyApiClientContext.Provider value={apiClient}>
            {children}
        </MisskeyApiClientContext.Provider>
    );
}