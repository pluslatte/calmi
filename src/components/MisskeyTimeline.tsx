'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Button, Divider, Transition } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowUp } from "@tabler/icons-react";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({ timelineType, scrollAreaRef, containerRef }: {
    timelineType: TimelineType;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<TimelineFeed>(null);
    const [rightOffset, setRightOffset] = useState<number | null>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const misskeyApiClient = useMisskeyApiClient();
    const isReturningToTop = useRef(false);
    const handleScrollToTop = () => {
        if (!scrollAreaRef.current) return;

        isReturningToTop.current = true;

        scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
            const timeline = timelineRef.current;
            if (!timeline) return;

            timeline.disableBufferingAndFlush();
            timeline.doAutoUpdateFeed = true;
            isReturningToTop.current = false;

            console.log("scroll to top completed, auto update re-enabled");
        }, 500);
    };

    useEffect(() => {
        const timeline = new TimelineFeed(timelineType, misskeyApiClient);
        timelineRef.current = timeline;

        const updateNotes = () => { setNotes(timeline.notes.value); }
        timeline.notes.subscribe(updateNotes);

        timeline.initFeed();

        return (() => {
            timeline.notes.unsubscribe(updateNotes);
            timeline.stream?.close();
        });
    }, [timelineType]);

    useEffect(() => {
        // workaround
        const timeout = setTimeout(() => {
            console.log("scrollAreaRef.current", scrollAreaRef.current);

            const handleScroll = () => {
                if (isReturningToTop.current) return;

                const scrollEl = scrollAreaRef.current;
                if (!scrollEl) return;

                const top = scrollEl.scrollTop;
                setShowScrollToTop(top > 100);

                const nearTop = top < 200;

                if (!nearTop && timelineRef.current?.doAutoUpdateFeed) {
                    timelineRef.current.doAutoUpdateFeed = false;
                    timelineRef.current.enableBuffering();
                    console.log("auto update disabled & buffering enabled");
                }
            };

            scrollAreaRef.current?.addEventListener('scroll', handleScroll);
            cleanup = () => scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
        }, 0);

        let cleanup: () => void;

        return () => {
            clearTimeout(timeout);
            cleanup?.();
        }
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    setLoadingMore(true);
                    timelineRef.current?.loadMore();
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
    }, [loadingMore])

    useEffect(() => {
        const updateOffset = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const offset = window.innerWidth - rect.right;
            setRightOffset(offset + 16);
        };

        updateOffset();
        window.addEventListener('resize', updateOffset);
        return () => window.removeEventListener('resize', updateOffset);
    }, [containerRef])

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
