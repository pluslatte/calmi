'use client';

import React, { memo, useCallback, useEffect } from 'react';
import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Button, Divider, Transition } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowUp } from "@tabler/icons-react";
import { useTimelineFeed } from "@/hooks/useTimelineFeed";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useTimelineScrollBehavior } from "@/hooks/useTimelineScrollBehavior";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({ timelineType, scrollAreaRef, containerRef }: {
    timelineType: TimelineType;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const misskeyApiClient = useMisskeyApiClient();

    const { notes, state, controls } = useTimelineFeed(timelineType, misskeyApiClient);

    const { sentinelRef } = useInfiniteScroll(controls.loadMore);

    const {
        showScrollToTop,
        rightOffset,
        handleScrollToTop
    } = useScrollToTop(scrollAreaRef, containerRef, controls.handleScrollToTop);

    const handleNearTop = useCallback(() => {
        controls.setAutoUpdate(true);
        controls.setBuffering(false);
    }, [controls]);

    const handleScrollDown = useCallback(() => {
        controls.setAutoUpdate(false);
        controls.setBuffering(true);
    }, [controls]);

    useTimelineScrollBehavior(
        scrollAreaRef,
        { autoUpdateThreshold: 0, bufferThreshold: 200 },
        { onNearTop: handleNearTop, onScrollDown: handleScrollDown }
    );

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

            {rightOffset !== null && (
                <Box
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: rightOffset,
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
