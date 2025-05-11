'use client';

import { api } from "misskey-js";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";

/**
 * MisskeyApiProvider - APIクライアントの初期化と管理を行うプロバイダーコンポーネント
 * 
 * @param initialClient 初期APIクライアント（オプション）
 * @param children 子コンポーネント
 */
export function MisskeyApiProvider({
    children
}: PropsWithChildren<{}>) {
    const { client, setClient } = useMisskeyApiStore();
    const [initialized, setInitialized] = useState(false);

    // クライアント自動初期化
    useEffect(() => {
        const initClient = async () => {
            // すでに初期化済みならスキップ
            if (client) {
                setInitialized(true);
                return;
            }

            try {
                // ブラウザ環境でなければスキップ
                if (typeof window === 'undefined') {
                    return;
                }

                const token = localStorage.getItem('misskey_token');
                const serverUrl = localStorage.getItem('misskey_server') || 'https://virtualkemomimi.net';

                if (!token) {
                    // トークンがない場合は初期化スキップ
                    setInitialized(true);
                    return;
                }

                // APIクライアントを初期化
                const misskeyApiClient = new api.APIClient({
                    origin: serverUrl,
                    credential: token,
                });

                setClient(misskeyApiClient);
            } catch (error) {
                console.error('Failed to initialize API client:', error);
            } finally {
                setInitialized(true);
            }
        };

        initClient();
    }, []); // clientを依存配列から削除

    // 初期化完了まで子要素を表示しない
    if (!initialized && typeof window !== 'undefined') {
        return null;
    }

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