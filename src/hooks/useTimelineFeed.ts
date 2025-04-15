import { TimelineFeed } from "@/lib/misskey/TimelineFeed";
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef, useState } from "react";

export function useTimelineFeed(timelineType: 'home' | 'social' | 'local' | 'global', misskeyApiClient: api.APIClient) {
    const [notes, setNotes] = useState<Note[]>([]);
    const timelineRef = useRef<TimelineFeed | null>(null);

    useEffect(() => {
        const timeline = new TimelineFeed(timelineType, misskeyApiClient);
        timelineRef.current = timeline;

        const updateNotes = () => { setNotes(timeline.notes.value); };
        timeline.notes.subscribe(updateNotes);

        timeline.initFeed();

        return (() => {
            timeline.notes.unsubscribe(updateNotes);
            timeline.stream?.close();
        });
    }, [timelineType, misskeyApiClient])

    const loadMore = () => {
        timelineRef.current?.loadMore();
    };

    const enableBuffering = () => {
        timelineRef.current?.enableBuffering();
    };

    const disableBufferingAndFlush = () => {
        timelineRef.current?.disableBufferingAndFlush();
    };

    const setAutoUpdateFeed = (enable: boolean) => {
        if (timelineRef.current) {
            timelineRef.current.doAutoUpdateFeed = enable;
        }
    };

    return {
        notes,
        loadMore,
        enableBuffering,
        disableBufferingAndFlush,
        setAutoUpdateFeed,
        timeline: timelineRef.current
    };
}