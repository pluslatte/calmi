import { TimelineFeed } from "@/lib/misskey/TimelineFeed";
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef, useState } from "react";

export type TimelineState = {
    isAutoUpdating: boolean;
    isBuffering: boolean;
    isLoading: boolean;
};

export function useTimelineFeed(
    timelineType: 'home' | 'social' | 'local' | 'global',
    misskeyApiClient: api.APIClient
) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [state, setState] = useState<TimelineState>({
        isAutoUpdating: true,
        isBuffering: false,
        isLoading: false,
    });

    const timelineRef = useRef<TimelineFeed | null>(null);

    useEffect(() => {
        const timeline = new TimelineFeed(timelineType, misskeyApiClient);
        timelineRef.current = timeline;

        const updateNotes = () => {
            setNotes(timeline.notes.value);
            setState(prev => ({
                ...prev,
                isLoading: false
            }));
        };

        timeline.notes.subscribe(updateNotes);
        timeline.initFeed();

        return (() => {
            timeline.notes.unsubscribe(updateNotes);
            timeline.cleanup(); // Call the new cleanup method
        });
    }, [timelineType, misskeyApiClient])

    const controls = {
        loadMore: () => {
            if (state.isLoading || !timelineRef.current) return;

            setState(prev => ({ ...prev, isLoading: true }));
            timelineRef.current.loadMore();
        },

        setAutoUpdate: (enabled: boolean) => {
            if (!timelineRef.current) return;

            timelineRef.current.isAutoUpdateEnabled = enabled;
            setState(prev => ({ ...prev, isAutoUpdating: enabled }));
        },

        setBuffering: (enabled: boolean) => {
            if (!timelineRef.current) return;

            if (enabled) {
                timelineRef.current.enableBuffering();
            } else {
                timelineRef.current.disableBufferingAndFlush();
            }

            setState(prev => ({ ...prev, isBuffering: enabled }));
        },

        handleScrollToTop: () => {
            if (!timelineRef.current) return;

            controls.setBuffering(false);
            controls.setAutoUpdate(true);
        }
    };

    return {
        notes,
        state,
        controls
    };
}