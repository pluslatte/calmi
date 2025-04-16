import React, { useEffect, useRef } from "react";

export type ScrollBehaviorOptions = {
    autoUpdateThreshold: number; // スクロール位置がこれより小さい場合、自動更新する
    bufferThreshold: number;     // スクロール位置がこれより大きい場合、バッファリングを開始する
};

export function useTimelineScrollBehavior(
    scrollRef: React.RefObject<HTMLDivElement | null>,
    options: ScrollBehaviorOptions = {
        autoUpdateThreshold: 200,
        bufferThreshold: 200,
    },
    callbacks: {
        onNearTop: () => void;
        onScrollDown: () => void;
    }
) {
    const { autoUpdateThreshold, bufferThreshold } = options;
    const lastScrollPosition = useRef(0);

    useEffect(() => {
        if (!scrollRef.current) return;

        const handleScroll = () => {
            const scrollEl = scrollRef.current;
            if (!scrollEl) return;

            const currentScrollTop = scrollEl.scrollTop;
            const isScrollingDown = currentScrollTop > lastScrollPosition.current;
            lastScrollPosition.current = currentScrollTop;

            if (currentScrollTop < autoUpdateThreshold) {
                callbacks.onNearTop()
            } else if (isScrollingDown && currentScrollTop > bufferThreshold) {
                callbacks.onScrollDown();
            }
        };

        scrollRef.current.addEventListener('scroll', handleScroll);
        return () => scrollRef.current?.removeEventListener('scroll', handleScroll);
    }, [scrollRef, autoUpdateThreshold, bufferThreshold, callbacks]);

    const resetScroll = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return { resetScroll };
}