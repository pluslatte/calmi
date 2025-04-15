'use client';

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Box, Center, Loader } from "@mantine/core";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useTimeline } from "@/hooks/useTimeline";
import { TimelineList } from "./timeline/TimelineList";
import { ScrollToTopButton } from "./timeline/ScrollToTopButton";
import { useMisskeyService } from "@/contexts/MisskeyContext";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({
    timelineType,
    scrollAreaRef,
    containerRef,
    onRegisterFunctions
}: {
    timelineType: TimelineType;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onRegisterFunctions?: (
        disableBufferingAndFlush: () => void,
        setAutoUpdateFeed: (enable: boolean) => void
    ) => void;
}) {
    const { service } = useMisskeyService();
    if (!service) {
        return (
            <Center p="xl">
                <Loader />
            </Center>
        );
    }

    const apiClient = service.getApiClient();

    let hasEnabledBufferingRef = useRef(false);

    const {
        notes,
        isLoading,
        loadMore,
        enableBuffering,
        disableBufferingAndFlush,
        setAutoUpdateFeed
    } = useTimeline(timelineType, apiClient)

    const disableBufferingAndFlushWithReset = useCallback(() => {
        disableBufferingAndFlush();
        // バッファリング状態のリセット
        hasEnabledBufferingRef.current = false;
        console.log("Buffering state reset - ready for next scroll");
    }, [disableBufferingAndFlush]);

    const {
        showScrollToTop,
        rightOffset,
        handleScrollToTop
    } = useScrollToTop(scrollAreaRef, containerRef, () => {
        disableBufferingAndFlushWithReset();
        setAutoUpdateFeed(true);
        console.log("sctoll to top completed, auto update re-enabled");
    });

    useEffect(() => {
        if (onRegisterFunctions) {
            onRegisterFunctions(disableBufferingAndFlushWithReset, setAutoUpdateFeed);
        }
    }, [disableBufferingAndFlushWithReset, setAutoUpdateFeed, onRegisterFunctions]);

    useEffect(() => {
        if (!scrollAreaRef.current) return;

        let debounceTimer: ReturnType<typeof setTimeout> | null = null;

        const handleScroll = () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                const scrollEl = scrollAreaRef.current;
                if (!scrollEl) return;

                const top = scrollEl.scrollTop;
                const nearTop = top < 200;

                if (!nearTop && !hasEnabledBufferingRef.current && notes.length > 0) {
                    setAutoUpdateFeed(false);
                    enableBuffering();
                    console.log("auto update disabled & buffering enabled");

                    hasEnabledBufferingRef.current = true
                }
            }, 200)
        };

        scrollAreaRef.current.addEventListener('scroll', handleScroll);

        return () => {
            scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
            if (debounceTimer) clearTimeout(debounceTimer);
        }
    }, [scrollAreaRef, notes.length, enableBuffering, setAutoUpdateFeed]);

    return (
        <Box pos="relative">
            <TimelineList
                notes={notes}
                onLoadMore={loadMore}
                isLoading={isLoading}
            />
            <ScrollToTopButton
                show={showScrollToTop}
                rightOffset={rightOffset}
                onClick={handleScrollToTop}
            />
        </Box>
    );
});
export default MisskeyTimeline;
