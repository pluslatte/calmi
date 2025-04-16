import { TimelineFeed } from "@/lib/misskey/TimelineFeed";
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef, useState } from "react";

export function useTimelineFeed(timelineType: 'home' | 'social' | 'local' | 'global', misskeyApiClient: api.APIClient) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [timelineAutoUpdateState, setTimelineAutoUpdateState] = useState(false);
    const [skippedNotesGroups, setSkippedNotesGroups] = useState<Array<{ count: number, timestamp: Date, position: number }>>([]);
    const timelineRef = useRef<TimelineFeed | null>(null);

    useEffect(() => {
        const timeline = new TimelineFeed(timelineType, misskeyApiClient);
        timelineRef.current = timeline;

        const updateNotes = () => {
            setNotes(timeline.notes.value);
            setSkippedNotesGroups(timeline.getSkippedNotesGroups());
        };

        timeline.notes.subscribe(updateNotes);
        timeline.initFeed();

        return (() => {
            timeline.notes.unsubscribe(updateNotes);
            timeline.cleanup(); // Call the new cleanup method
        });
    }, [timelineType, misskeyApiClient])

    const loadMore = () => {
        timelineRef.current?.loadMore();
    };

    const setAutoUpdateFeed = (enable: boolean) => {
        if (timelineRef.current) {
            timelineRef.current.autoUpdateEnabled = enable;
            setTimelineAutoUpdateState(enable);
        }
    };

    return {
        notes,
        loadMore,
        setAutoUpdateFeed,
        timelineAutoUpdateState,
        skippedNotesGroups,
    };
}