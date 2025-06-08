import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api, Stream } from 'misskey-js';
import { Notification } from 'misskey-js/entities.js';
import { Connection } from 'misskey-js/streaming.js';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string | null;
    stream: Stream | null;
    connection: Connection<any> | null;
    lastReadAt: Date | null;
}

interface NotificationActions {
    initializeNotifications: (client: api.APIClient) => void;
    loadNotifications: (client: api.APIClient) => Promise<void>;
    markAsRead: () => void;
    addNotification: (notification: Notification) => void;
    clearError: () => void;
    cleanupNotifications: () => void;
}

// デフォルト値
const MAX_NOTIFICATIONS = 50;

export const useNotificationStore = create<NotificationState & NotificationActions>()(
    immer((set, get) => ({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        hasError: false,
        errorMessage: null,
        stream: null,
        connection: null,
        lastReadAt: null,

        // 通知の初期化
        initializeNotifications: (client) => {
            // 既存のリソースのクリーンアップ
            const currentStream = get().stream;
            if (currentStream) {
                currentStream.close();
            }

            // トークンがない場合は何もしない
            if (!client.credential) {
                return;
            }

            // 新しいストリームを作成
            const newStream = new Stream(client.origin, { token: client.credential });

            // main接続を使用
            const connection = newStream.useChannel('main');

            // 通知イベントのリスナー設定
            connection.on('notification', (notification: Notification) => {
                get().addNotification(notification);
            });

            set(state => {
                state.stream = newStream;
                state.connection = connection;
                state.unreadCount = 0;
                state.lastReadAt = new Date();
            });
        },

        // 通知の読み込み
        loadNotifications: async (client) => {
            set(state => { state.isLoading = true; state.hasError = false; });

            try {
                const notifications = await client.request('i/notifications', {
                    limit: 30,
                });

                set(state => {
                    state.notifications = notifications;
                    state.isLoading = false;

                    // 未読数の計算（最後に既読にした時間以降の通知）
                    if (state.lastReadAt) {
                        state.unreadCount = notifications.filter(n =>
                            new Date(n.createdAt) > state.lastReadAt!
                        ).length;
                    } else {
                        state.unreadCount = notifications.length;
                    }
                });
            } catch (error) {
                console.error('Failed to load notifications:', error);
                set(state => {
                    state.hasError = true;
                    state.errorMessage = error instanceof Error ? error.message : '通知の読み込みに失敗しました';
                    state.isLoading = false;
                });
            }
        },

        // 既読にする
        markAsRead: () => {
            set(state => {
                state.unreadCount = 0;
                state.lastReadAt = new Date();
            });
        },

        // 新しい通知の追加
        addNotification: (notification) => {
            set(state => {
                // 重複チェック
                if (!state.notifications.some(n => n.id === notification.id)) {
                    // 先頭に追加
                    state.notifications.unshift(notification);
                    state.unreadCount += 1;

                    // 最大数を超えた場合は古いものを削除
                    if (state.notifications.length > MAX_NOTIFICATIONS) {
                        state.notifications.pop();
                    }
                }
            });
        },

        // エラークリア
        clearError: () => {
            set(state => {
                state.hasError = false;
                state.errorMessage = null;
            });
        },

        // リソースのクリーンアップ
        cleanupNotifications: () => {
            const stream = get().stream;
            if (stream) {
                stream.close();
            }

            set(state => {
                state.stream = null;
                state.connection = null;
            });
        }
    }))
);