import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api, Endpoints } from 'misskey-js';
import { Note, User } from 'misskey-js/entities.js';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export type PossibleEndPoints = keyof Endpoints;

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

// ストア状態の型定義
interface MisskeyApiState {
    client: api.APIClient | null;
    apiState: ApiState;
    isLoggedIn: boolean;
}

// アクションの型定義
interface MisskeyApiActions {
    // 基本API操作
    setClient: (client: api.APIClient) => void;
    logout: () => void;
    clearError: () => void;

    executeApiRequest: <T>(endpoint: PossibleEndPoints, params: any, errorMessage: string) => Promise<T>;

    // エンドポイント関連のアクション
    getHomeTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getHybridTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getLocalTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getGlobalTimeline: (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;
    getNote: (noteId: string) => Promise<Note>;
    createNote: (text: string, visibility?: 'public' | 'home' | 'followers' | 'specified') => Promise<{ createdNote: Note }>;
    getEmoji: (name: string) => Promise<{ url: string; name: string }>;
    getUserInfo: () => Promise<User>;

    uploadFile: (file: File) => Promise<{ id: string; name: string; url: string; }>;
    createNoteWithMedia: (
        text: string,
        fileIds: string[],
        visibility?: 'public' | 'home' | 'followers' | 'specified'
    ) => Promise<{ createdNote: Note }>;
}

// デフォルト値
const defaultApiState: ApiState = {
    loading: false,
    error: null
};

// APIエラー処理の共通メソッド
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

// 通知表示関数
const showNotification = (error: ApiError) => {
    notifications.show({
        title: 'エラーが発生しました',
        message: error.message,
        color: 'red',
        icon: IconX({}),
        autoClose: 5000,
    });
};

// Zustandストアの作成
export const useMisskeyApiStore = create<MisskeyApiState & MisskeyApiActions>()(
    immer((set, get) => ({
        // 初期状態
        client: null,
        apiState: defaultApiState,
        isLoggedIn: false,

        // APIクライアントの設定
        setClient: (client) => {
            set(state => {
                state.client = client;
                state.isLoggedIn = !!client;
            });
        },

        // ログアウト処理
        logout: () => {
            localStorage.removeItem('misskey_token');

            set(state => {
                state.client = null;
                state.isLoggedIn = false;
                state.apiState.error = null;
            });

            notifications.show({
                title: 'ログアウトしました',
                message: 'ログアウトに成功しました',
                color: 'cyan',
                icon: IconCheck({}),
                autoClose: 3000,
            });
        },

        // エラークリア
        clearError: () => {
            set(state => {
                state.apiState.error = null;
            });
        },

        // APIリクエスト共通ラッパー
        executeApiRequest: async <T>(
            endpoint: PossibleEndPoints,
            params: any,
            errorMessage: string
        ): Promise<T> => {
            const state = get();

            if (!state.client) {
                const error: ApiError = {
                    type: 'auth',
                    message: 'APIクライアントが初期化されていません。ログインしてください。'
                };

                set(state => {
                    state.apiState.loading = false;
                    state.apiState.error = error;
                });

                showNotification(error);
                throw new Error(error.message);
            }

            set(state => {
                state.apiState.loading = true;
                state.apiState.error = null;
            });

            try {
                const result = await state.client.request(endpoint as any, params) as T;

                set(state => {
                    state.apiState.loading = false;
                });

                return result;
            } catch (err: any) {
                const errorType = determineErrorType(err);
                const errorMsg = formatErrorMessage(errorType, err);

                const apiError: ApiError = {
                    type: errorType,
                    message: errorMsg || errorMessage,
                    original: err,
                    statusCode: err.response?.status
                };

                set(state => {
                    state.apiState.loading = false;
                    state.apiState.error = apiError;
                });

                showNotification(apiError);

                if (errorType === 'auth') {
                    get().logout();
                }

                throw apiError;
            }
        },

        // 各APIエンドポイントの実装
        getHomeTimeline: async (params = {}) => {
            return await get().executeApiRequest<Note[]>(
                'notes/timeline',
                params,
                'タイムラインの取得に失敗しました'
            );
        },

        getHybridTimeline: async (params = {}) => {
            return await get().executeApiRequest<Note[]>(
                'notes/hybrid-timeline',
                params,
                'ハイブリッドタイムラインの取得に失敗しました'
            );
        },

        getLocalTimeline: async (params = {}) => {
            return await get().executeApiRequest<Note[]>(
                'notes/local-timeline',
                params,
                'ローカルタイムラインの取得に失敗しました'
            );
        },

        getGlobalTimeline: async (params = {}) => {
            return await get().executeApiRequest<Note[]>(
                'notes/global-timeline',
                params,
                'グローバルタイムラインの取得に失敗しました'
            );
        },

        getNote: async (noteId) => {
            return await get().executeApiRequest<Note>(
                'notes/show',
                { noteId },
                'ノートの取得に失敗しました'
            );
        },

        createNote: async (text, visibility = 'home') => {
            return await get().executeApiRequest<{ createdNote: Note }>(
                'notes/create',
                { text, visibility },
                'ノートの投稿に失敗しました'
            );
        },

        getEmoji: async (name) => {
            return await get().executeApiRequest<{ url: string; name: string }>(
                'emoji',
                { name },
                '絵文字の取得に失敗しました'
            );
        },

        getUserInfo: async () => {
            return await get().executeApiRequest<User>(
                'i',
                {},
                'ユーザー情報の取得に失敗しました'
            );
        },

        uploadFile: async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            // FormDataをアップロード用のエンドポイントに送信
            return await get().executeApiRequest(
                'drive/files/create',
                formData,
                'ファイルのアップロードに失敗しました'
            );
        },

        createNoteWithMedia: async (text, fileIds, visibility = 'home') => {
            return await get().executeApiRequest(
                'notes/create',
                {
                    text,
                    visibility,
                    fileIds // ドライブにアップロードしたファイルのID配列
                },
                'ノートの投稿に失敗しました'
            );
        },
    }))
);