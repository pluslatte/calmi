'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Divider } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({ timelineType }: { timelineType: TimelineType }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<TimelineFeed>(null);
    const misskeyApiClient = useMisskeyApiClient();

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
        </React.Fragment>
    );
});
export default MisskeyTimeline;
