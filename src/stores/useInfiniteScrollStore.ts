import { Note } from "misskey-js/entities.js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface InfiniteScrollState {
    // 無限スクロール用の状態
    isInfiniteScrollLoadingMore: boolean;
    lastLoadMoreTime: number;
}

interface InfiniteScrollActions {
    // 無限スクロール関連のアクション
    initializeInfiniteScroll: () => void;
    handleInfiniteScroll: (
        entries: IntersectionObserverEntry[],
        getTimelineFn: (params?: any) => Promise<Note[]>,
        onIntersection: (getTimelineFn: (params?: any) => Promise<Note[]>) => Promise<void>,
    ) => Promise<void>;
    getInfiniteScrollProps: (
        getTimelineFn: (params?: any) => Promise<Note[]>,
        onIntersection: (getTimelineFn: (params?: any) => Promise<Note[]>) => Promise<void>,
        timeoutMs?: number,
    ) => {
        isInfiniteScrollLoadingMore: boolean;
        infiniteScrollRef: (node: HTMLDivElement | null) => void;
    };
}

const DEFAULT_INFINITE_SCROLL_TIMEOUT = 1000; // デフォルトのタイムアウト値 (ms)

export const useInfiniteScrollStore = create<InfiniteScrollState & InfiniteScrollActions>()(
    immer((set, get) => ({
        // 状態と初期値
        isInfiniteScrollLoadingMore: false,
        lastLoadMoreTime: 0,

        // アクション
        initializeInfiniteScroll: () => {
            set(state => {
                state.isInfiniteScrollLoadingMore = false;
                state.lastLoadMoreTime = 0;
            })
        },

        // 無限スクロール：交差検出時のハンドラ
        handleInfiniteScroll: async (entries, getTimelineFn, onIntersection) => {
            const state = get();
            if (state.isInfiniteScrollLoadingMore) return;

            // 交差検出
            if (entries[0].isIntersecting) {
                const now = Date.now();
                // 前回のロードからの経過時間チェック
                if (now - state.lastLoadMoreTime < DEFAULT_INFINITE_SCROLL_TIMEOUT) {
                    return;
                }

                set(state => {
                    state.isInfiniteScrollLoadingMore = true;
                    state.lastLoadMoreTime = now;
                });

                try {
                    await onIntersection(getTimelineFn);
                } catch (error) {
                    console.error('Error loading more content:', error);
                } finally {
                    // タイムアウト後にロード状態をリセット
                    setTimeout(() => {
                        set(state => { state.isInfiniteScrollLoadingMore = false; });
                    }, DEFAULT_INFINITE_SCROLL_TIMEOUT);
                }
            }
        },

        // 無限スクロール：フックスタイルのインターフェース
        getInfiniteScrollProps: (getTimelineFn, onIntersection) => {
            // IntersectionObserverのセットアップを行う関数
            const infiniteScrollRef = (node: HTMLDivElement | null) => {
                if (node === null) return;

                // observer作成
                const observer = new IntersectionObserver(
                    (entries) => {
                        const store = get();
                        store.handleInfiniteScroll(entries, getTimelineFn, onIntersection);
                    },
                    { rootMargin: '100px' }
                );

                // 監視開始
                observer.observe(node);

                // クリーンアップ関数（React.useEffectの戻り値と同様）
                return () => {
                    observer.disconnect();
                };
            };

            return {
                isInfiniteScrollLoadingMore: get().isInfiniteScrollLoadingMore,
                infiniteScrollRef
            };
        }
    }))
)