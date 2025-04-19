// src/stores/useInfiniteScrollStore.ts
import { Note } from "misskey-js/entities.js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface InfiniteScrollState {
    isLoading: boolean;
    lastLoadTime: number;
}

interface InfiniteScrollActions {
    initialize: () => void;
    useInfiniteScroll: <T>(
        loadMoreFn: () => Promise<T[]>,
        timeoutMs?: number
    ) => {
        observerRef: (node: HTMLElement | null) => void;
    };
}

const DEFAULT_TIMEOUT = 1000; // ms

export const useInfiniteScrollStore = create<InfiniteScrollState & InfiniteScrollActions>()(
    immer((set, get) => ({
        // 状態
        isLoading: false,
        lastLoadTime: 0,

        // アクション
        initialize: () => {
            set(state => {
                state.isLoading = false;
                state.lastLoadTime = 0;
            });
        },

        useInfiniteScroll: <T>(loadMoreFn: () => Promise<T[]>, timeoutMs = DEFAULT_TIMEOUT) => {
            const handleIntersection = async (entries: IntersectionObserverEntry[]) => {
                const state = get();
                if (state.isLoading) return;

                // 交差検出
                if (entries[0]?.isIntersecting) {
                    const now = Date.now();
                    // 前回のロードからの経過時間チェック
                    if (now - state.lastLoadTime < timeoutMs) {
                        return;
                    }

                    set(state => {
                        state.isLoading = true;
                        state.lastLoadTime = now;
                    });

                    try {
                        await loadMoreFn();
                    } catch (error) {
                        console.error('Infinite scroll error:', error);
                    } finally {
                        // タイムアウト後にロード状態をリセット
                        setTimeout(() => {
                            set(state => { state.isLoading = false; });
                        }, timeoutMs);
                    }
                }
            };

            const observerRef = (node: HTMLElement | null) => {
                if (!node) return;

                const observer = new IntersectionObserver(handleIntersection, {
                    rootMargin: '100px'
                });

                observer.observe(node);

                return () => {
                    observer.disconnect();
                };
            };

            return {
                observerRef
            };
        }
    }))
);