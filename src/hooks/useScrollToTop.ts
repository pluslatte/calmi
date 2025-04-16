// hooks/useScrollToTop.ts
import { useEffect, useRef, useState } from 'react';

export function useScrollToTop(
    scrollAreaRef: React.RefObject<HTMLDivElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
) {
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [buttonRightOffset, setButtonRightOffset] = useState<number | null>(null);

    // スクロール位置の監視
    useEffect(() => {
        if (!scrollAreaRef.current) return;

        const handleScroll = () => {
            const scrollEl = scrollAreaRef.current;
            if (!scrollEl) return;

            const top = scrollEl.scrollTop;
            setShowScrollToTop(top > 100);

            return { top, nearTop: top < 200 };
        };

        scrollAreaRef.current.addEventListener('scroll', handleScroll);
        return () => scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
    }, [scrollAreaRef]);

    // 右側のオフセット計算
    useEffect(() => {
        const updateOffset = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const offset = window.innerWidth - rect.right;
            setButtonRightOffset(offset + 16);
        };

        updateOffset();
        window.addEventListener('resize', updateOffset);
        return () => window.removeEventListener('resize', updateOffset);
    }, [containerRef]);

    // スクロールトップ機能
    const handleScrollToTop = () => {
        if (!scrollAreaRef.current) return;
        scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        showScrollToTop,
        buttonRightOffset: buttonRightOffset,
        handleScrollToTop
    };
}