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

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({ timelineType, scrollAreaRef, containerRef }: {
    timelineType: TimelineType;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const misskeyApiClient = useMisskeyApiClient();

    const {
        notes,
        loadMore,
        setAutoUpdateFeed
    } = useTimelineFeed(timelineType, misskeyApiClient);

    const { sentinelRef } = useInfiniteScroll(loadMore);

    const {
        showScrollToTop,
        buttonRightOffset,
        handleScrollToTop
    } = useScrollToTop(scrollAreaRef, containerRef);

    useEffect(() => {
        if (!scrollAreaRef.current) return;

        const handleScroll = () => {
            const scrollEl = scrollAreaRef.current;
            if (!scrollEl) return;

            const top = scrollEl.scrollTop;
            const nearTop = top < 200;

            if (!nearTop && notes.length > 0) {
                setAutoUpdateFeed(false);
            } else if (nearTop) {
                setAutoUpdateFeed(true);
            }
        };

        scrollAreaRef.current.addEventListener('scroll', handleScroll);
        return () => scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
    }, [scrollAreaRef, notes.length, setAutoUpdateFeed]);

    return (
        <Box pos="relative">
            {notes.map(note => (
                <Box key={note.id}>
                    <MisskeyNote note={note} />
                    <MisskeyNoteActions />
                    <Divider my="sm" />
                </Box>
            ))}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {buttonRightOffset !== null && (
                <Box
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: buttonRightOffset,
                        zIndex: 1000,
                    }}
                >
                    <Transition mounted={showScrollToTop} transition="slide-up" duration={200} timingFunction="ease">
                        {(styles) => (
                            <Button
                                leftSection={<IconArrowUp size={16} />}
                                style={styles}
                                onClick={handleScrollToTop}
                                variant="light"
                            >
                                上へ戻る
                            </Button>
                        )}
                    </Transition>
                </Box>
            )}
        </Box>
    );
});
export default MisskeyTimeline;
