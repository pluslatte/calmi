'use client';

import { api } from "misskey-js";
import { Note, User } from "misskey-js/entities.js";
import React, { createContext, useContext, useState, useCallback } from "react";
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

// エラータイプを定義
export type ApiErrorType =
    | 'network'
    | 'auth'
    | 'rate_limit'
    | 'server'
    | 'unknown';

// エラー情報の型
export interface ApiError {
    type: ApiErrorType;
    message: string;
    original?: any;
    statusCode?: number;
}

// API通信の状態管理用の型
interface ApiState {
    loading: boolean;
    error: ApiError | null;
}

// コンテキストで提供する値の型
interface MisskeyApiContextValue {
    client: api.APIClient | null;
    apiState: ApiState;
    // よく使うエンドポイントへのアクセス関数
    getHomeTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getHybridTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getLocalTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getGlobalTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getNote: (noteId: string) => Promise<Note>;
    createNote: (text: string, visibility?: 'public' | 'home' | 'followers' | 'specified') => Promise<{ createdNote: Note }>;
    getEmoji: (name: string) => Promise<{ url: string; name: string }>;
    getUserInfo: () => Promise<User>;
    // その他の汎用的な操作
    clearError: () => void;
    setClient: (client: api.APIClient) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

// デフォルト値
const defaultApiState: ApiState = {
    loading: false,
    error: null
};

// コンテキストの作成
export const MisskeyApiClientContext = createContext<MisskeyApiContextValue | null>(null);

// フックの定義
export function useMisskeyApiClient(): MisskeyApiContextValue {
    const context = useContext(MisskeyApiClientContext);

    if (!context) {
        throw new Error('useMisskeyApiClient must be used within an MisskeyApiClientProvider');
    }

    return context;
}

export function MisskeyApiClientProvider({
    children,
    initialClient = null
}: {
    children: React.ReactNode,
    initialClient?: api.APIClient | null
}) {
    const [client, setClient] = useState<api.APIClient | null>(initialClient);
    const [apiState, setApiState] = useState<ApiState>(defaultApiState);

    // エラーの種類を判断するヘルパー関数
    const determineErrorType = (error: any): ApiErrorType => {
        if (!error) return 'unknown';

        if (error.response) {
            const status = error.response.status;
            if (status === 401 || status === 403) return 'auth';
            if (status === 429) return 'rate_limit';
            if (status >= 500) return 'server';
            return 'unknown';
        }

        if (error.message && error.message.includes('Network Error')) {
            return 'network';
        }

        return 'unknown';
    };

    // エラーメッセージをフォーマットする関数
    const formatErrorMessage = (type: ApiErrorType, error: any): string => {
        switch (type) {
            case 'network':
                return 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください。';
            case 'auth':
                return '認証エラーが発生しました。ログインし直してください。';
            case 'rate_limit':
                return 'APIレート制限に達しました。しばらく経ってから再試行してください。';
            case 'server':
                return 'サーバーエラーが発生しました。しばらく経ってから再試行してください。';
            default:
                return error?.message || 'エラーが発生しました。';
        }
    };

    // 通知を表示する関数
    const showNotification = (error: ApiError) => {
        notifications.show({
            title: 'エラーが発生しました',
            message: error.message,
            color: 'red',
            icon: <IconX />,
            autoClose: 5000,
        });
    };

    // エラーをクリアする関数
    const clearError = useCallback(() => {
        setApiState(prev => ({ ...prev, error: null }));
    }, []);

    // ログアウト関数
    const logout = useCallback(() => {
        localStorage.removeItem('misskey_token');
        setClient(null);
        notifications.show({
            title: 'ログアウトしました',
            message: 'ログアウトに成功しました',
            color: 'cyan',
            icon: <IconCheck />,
            autoClose: 3000,
        });
    }, []);

    // ホームタイムライン取得
    const getHomeTimeline = useCallback(async (params?: { limit?: number; untilId?: string }): Promise<Note[]> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('notes/timeline', params || {});
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // ソーシャルタイムライン取得
    const getHybridTimeline = useCallback(async (params?: { limit?: number; untilId?: string }): Promise<Note[]> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('notes/hybrid-timeline', params || {});
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // ローカルタイムライン取得
    const getLocalTimeline = useCallback(async (params?: { limit?: number; untilId?: string }): Promise<Note[]> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('notes/local-timeline', params || {});
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // グローバルタイムライン取得
    const getGlobalTimeline = useCallback(async (params?: { limit?: number; untilId?: string }): Promise<Note[]> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('notes/global-timeline', params || {});
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // 単一ノート取得
    const getNote = useCallback(async (noteId: string): Promise<Note> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('notes/show', { noteId });
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // ノート作成
    const createNote = useCallback(async (text: string, visibility: 'public' | 'home' | 'followers' | 'specified' = 'home'): Promise<{ createdNote: Note }> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('notes/create', {
                text,
                visibility,
            });
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // 絵文字取得
    const getEmoji = useCallback(async (name: string): Promise<{ url: string; name: string }> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('emoji', { name });
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // ユーザー情報取得
    const getUserInfo = useCallback(async (): Promise<User> => {
        if (!client) {
            const error: ApiError = {
                type: 'auth',
                message: 'APIクライアントが初期化されていません。ログインしてください。'
            };
            setApiState({ loading: false, error });
            showNotification(error);
            throw new Error(error.message);
        }

        setApiState({ loading: true, error: null });

        try {
            const result = await client.request('i', {});
            setApiState({ loading: false, error: null });
            return result;
        } catch (err: any) {
            const errorType = determineErrorType(err);
            const errorMessage = formatErrorMessage(errorType, err);

            const apiError: ApiError = {
                type: errorType,
                message: errorMessage,
                original: err,
                statusCode: err.response?.status
            };

            setApiState({ loading: false, error: apiError });
            showNotification(apiError);

            if (errorType === 'auth') {
                logout();
            }

            throw apiError;
        }
    }, [client, logout]);

    // コンテキスト値の作成
    const value: MisskeyApiContextValue = {
        client,
        apiState,
        getHomeTimeline,
        getHybridTimeline,
        getLocalTimeline,
        getGlobalTimeline,
        getNote,
        createNote,
        getEmoji,
        getUserInfo,
        clearError,
        setClient,
        logout,
        isLoggedIn: !!client
    };

    return (
        <MisskeyApiClientContext.Provider value={value}>
            {children}
        </MisskeyApiClientContext.Provider>
    );
}