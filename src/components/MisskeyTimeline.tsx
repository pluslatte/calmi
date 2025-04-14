'use client';

import React, { memo, useEffect, useState } from 'react';
import { TimelineFeed } from '@/lib/misskey/TimelineFeed';
import { Note } from "misskey-js/entities.js";
import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Divider } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({ timelineType }: { timelineType: TimelineType }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const misskeyApiClient = useMisskeyApiClient();

    useEffect(() => {
        const timeline = new TimelineFeed(timelineType, misskeyApiClient);

        const callback = () => {
            setNotes(timeline.notes.value);
        }

        timeline.notes.subscribe(callback);
        timeline.initFeed();

        return (() => {
            timeline.notes.unsubscribe(callback);
            timeline.stream?.close();
        });
    }, [timelineType]);

    return (
        <React.Fragment>
            {notes.map(note => (
                <Box key={note.id}>
                    <MisskeyNote note={note} />
                    <MisskeyNoteActions />
                    <Divider my="sm" />
                </Box>
            ))}
        </React.Fragment>
    );
});
export default MisskeyTimeline;
