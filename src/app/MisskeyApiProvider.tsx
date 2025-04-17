'use client';

import { api } from "misskey-js";
import React, { PropsWithChildren, useEffect } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";

/**
 * MisskeyApiProvider - APIクライアントの初期化と管理を行うプロバイダーコンポーネント
 * 
 * @param initialClient 初期APIクライアント（オプション）
 * @param children 子コンポーネント
 */
export function MisskeyApiProvider({
    initialClient = null,
    children
}: PropsWithChildren<{
    initialClient?: api.APIClient | null
}>) {
    const { setClient } = useMisskeyApiStore();

    // 初期クライアントの設定
    useEffect(() => {
        if (initialClient) {
            setClient(initialClient);
        }
    }, [initialClient, setClient]);

    return <>{children}</>;
}

/**
 * このコンポーネントを使用して、アプリケーション内でMisskeyのAPIクライアントを利用可能にします。
 * 通常は、src/app/dashboard/layout.tsxなどの高レベルのレイアウトファイルで使用します。
 * 
 * 例:
 * ```tsx
 * export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 *     const [client, setClient] = useState<api.APIClient | null>(null);
 *     
 *     // クライアント初期化ロジック...
 *     
 *     return (
 *         <MisskeyApiProvider initialClient={client}>
 *             {children}
 *         </MisskeyApiProvider>
 *     );
 * }
 * ```
 */