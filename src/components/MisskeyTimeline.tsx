'use client';

import React, { memo, useEffect } from 'react';
import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Button, Divider, Transition } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowUp } from "@tabler/icons-react";
import { useTimelineFeed } from "@/hooks/useTimelineFeed";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useTimeline } from "@/hooks/useTimeline";
import { TimelineList } from "./timeline/TimelineList";
import { ScrollToTopButton } from "./timeline/ScrollToTopButton";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({
    timelineType,
    scrollAreaRef,
    containerRef
}: {
    timelineType: TimelineType;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const misskeyApiClient = useMisskeyApiClient();

    const {
        notes,
        isLoading,
        loadMore,
        enableBuffering,
        disableBufferingAndFlush,
        setAutoUpdateFeed
    } = useTimeline(timelineType, misskeyApiClient)

    const {
        showScrollToTop,
        rightOffset,
        handleScrollToTop
    } = useScrollToTop(scrollAreaRef, containerRef, () => {
        disableBufferingAndFlush();
        setAutoUpdateFeed(true);
        console.log("sctoll to top completed, auto update re-enabled");
    });

    useEffect(() => {
        if (!scrollAreaRef.current) return;

        const handleScroll = () => {
            const scrollEl = scrollAreaRef.current;
            if (!scrollEl) return;

            const top = scrollEl.scrollTop;
            const nearTop = top < 200;

            if (!nearTop && notes.length > 0) {
                setAutoUpdateFeed(false);
                enableBuffering();
                console.log("auto update disabled & buffering enabled");
            }
        };

        scrollAreaRef.current.addEventListener('scroll', handleScroll);
        return () => scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
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
