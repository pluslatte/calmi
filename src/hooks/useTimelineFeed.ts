import { TimelineFeed } from "@/lib/misskey/TimelineFeed";
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef, useState } from "react";

export function useTimelineFeed(timelineType: 'home' | 'social' | 'local' | 'global', misskeyApiClient: api.APIClient) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [timelineAutoUpdateState, setTimelineAutoUpdateState] = useState(true);
    const [skippedNotesGroups, setSkippedNotesGroups] = useState<Array<{ count: number, timestamp: Date, referenceNoteId: string, loadedNotes: Note[] | null, isLoading: boolean }>>([]);
    const [trimmedNotesGroup, setTrimmedNotesGroup] = useState<{ count: number, timestamp: Date, trimmedNoteIds: string[], loadedNotes: Note[] | null, isLoading: boolean } | null>(null);
    const [loadingSkippedNotes, setLoadingSkippedNotes] = useState<boolean>(false);
    const [loadingTrimmedNotes, setLoadingTrimmedNotes] = useState<boolean>(false);
    const [lastSwitchToAutoUpdateTime, setLastSwitchToAutoUpdateTime] = useState<Date | null>(null);
    const timelineRef = useRef<TimelineFeed | null>(null);

    useEffect(() => {
        const timeline = new TimelineFeed(timelineType, misskeyApiClient);
        timelineRef.current = timeline;

        const updateNotes = () => {
            setNotes(timeline.notes.value);
            setSkippedNotesGroups(timeline.getSkippedNotesGroups());
            setTrimmedNotesGroup(timeline.getTrimmedNotesGroup());
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

    const loadSkippedNotes = async (groupIndex: number) => {
        if (!timelineRef.current || loadingSkippedNotes) return null;

        setLoadingSkippedNotes(true);
        try {
            const loadedNotes = await timelineRef.current.loadSkippedNotes(groupIndex);
            setLoadingSkippedNotes(false);
            return loadedNotes;
        } catch (error) {
            console.error('Error loading skipped notes:', error);
            setLoadingSkippedNotes(false);
            return null;
        }
    };

    const loadTrimmedNotes = async () => {
        if (!timelineRef.current || loadingTrimmedNotes) return null;

        setLoadingTrimmedNotes(true);
        try {
            const loadedNotes = await timelineRef.current.loadTrimmedNotes();
            setLoadingTrimmedNotes(false);
            return loadedNotes;
        } catch (error) {
            console.error('Error loading trimmed notes:', error);
            setLoadingTrimmedNotes(false);
            return null;
        }
    };

    const setAutoUpdateFeed = (enable: boolean) => {
        if (timelineRef.current) {
            // 自動更新がオフ→オンと切り替わった場合は、その時刻を記録
            if (enable && !timelineRef.current.autoUpdateEnabled) {
                setLastSwitchToAutoUpdateTime(new Date());
            }

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
        loadSkippedNotes,
        loadingSkippedNotes,
        trimmedNotesGroup,
        loadTrimmedNotes,
        loadingTrimmedNotes,
        lastSwitchToAutoUpdateTime,
    };
}