'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Affix, Box, Button, Divider, Transition } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowUp } from "@tabler/icons-react";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({ timelineType, scrollAreaRef, }: { timelineType: TimelineType; scrollAreaRef: React.RefObject<HTMLDivElement | null>; }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<TimelineFeed>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const misskeyApiClient = useMisskeyApiClient();
    const handleScrollToTop = () => {
        scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        timelineRef.current?.reloadLatest();
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
                if (scrollAreaRef.current) {
                    setShowScrollToTop(scrollAreaRef.current.scrollTop > 100);
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

    return (
        <React.Fragment>
            {notes.map(note => (
                <Box key={note.id}>
                    <MisskeyNote note={note} />
                    <MisskeyNoteActions />
                    <Divider my="sm" />
                </Box>
            ))}
            <div ref={sentinelRef} style={{ height: 1 }} />
            <Affix position={{ top: 20, left: "50%" }}>
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
            </Affix>
        </React.Fragment>
    );
});
export default MisskeyTimeline;
