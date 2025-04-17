// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useState } from 'react';

export function useInfiniteScroll(loadMore: () => Promise<any>, timeoutMs: number = 1000) {
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const lastLoadTimeRef = useRef<number>(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    const now = Date.now();
                    // 前回のロードからtimeoutMs経過していない場合はロードをスキップ
                    if (now - lastLoadTimeRef.current < timeoutMs) {
                        return;
                    }

                    setLoadingMore(true);
                    lastLoadTimeRef.current = now;

                    try {
                        await loadMore();
                    } catch (error) {
                        console.error('Error loading more content:', error);
                    } finally {
                        // タイムアウト後にロード状態をリセット
                        setTimeout(() => {
                            setLoadingMore(false);
                        }, timeoutMs);
                    }
                }
            },
            { rootMargin: '100px' }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [loadingMore, loadMore, timeoutMs]);

    return {
        sentinelRef,
        isLoading: loadingMore
    };
}