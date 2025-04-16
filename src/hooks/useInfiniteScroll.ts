// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useState } from 'react';

export function useInfiniteScroll(loadMore: () => void) {
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    setLoadingMore(true);
                    loadMore();
                    setLoadingMore(false);
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
    }, [loadingMore, loadMore]);

    return {
        sentinelRef
    };
}