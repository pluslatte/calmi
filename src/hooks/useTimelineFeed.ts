import { TimelineFeed } from "@/lib/misskey/TimelineFeed";
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef, useState } from "react";

// タイムライン取得用の関数の型定義
type TimelineRequestFunction = (params?: { limit?: number; untilId?: string }) => Promise<Note[]>;

export function useTimelineFeed(
    timelineType: 'home' | 'social' | 'local' | 'global',
    apiClient: api.APIClient | null,
    timelineRequestFn: TimelineRequestFunction
) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [timelineAutoUpdateState, setTimelineAutoUpdateState] = useState(true);
    const [skippedNotesGroups, setSkippedNotesGroups] = useState<Array<{ count: number, timestamp: Date, referenceNoteId: string, loadedNotes: Note[] | null, isLoading: boolean }>>([]);
    const [trimmedNotesGroup, setTrimmedNotesGroup] = useState<{ count: number, timestamp: Date, trimmedNoteIds: string[], loadedNotes: Note[] | null, isLoading: boolean } | null>(null);
    const [loadingSkippedNotes, setLoadingSkippedNotes] = useState<boolean>(false);
    const [loadingTrimmedNotes, setLoadingTrimmedNotes] = useState<boolean>(false);
    const [lastSwitchToAutoUpdateTime, setLastSwitchToAutoUpdateTime] = useState<Date | null>(null);
    const timelineRef = useRef<TimelineFeed | null>(null);

    useEffect(() => {
        // apiClientがnullの場合は早期リターン
        if (!apiClient) return;

        const timeline = new TimelineFeed(timelineType, apiClient);
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
            timeline.cleanup();
        });
    }, [timelineType, apiClient]);

    const loadMore = async (): Promise<boolean> => {
        console.log('loadMore');
        if (!timelineRef.current || !apiClient) return false;

        try {
            const len = notes.length;
            const lastNoteId = notes[len - 1]?.id;
            const limit = 20;

            if (lastNoteId) {
                const newNotes = await timelineRequestFn({
                    limit,
                    untilId: lastNoteId
                });

                if (newNotes && newNotes.length > 0) {
                    newNotes.forEach(note => {
                        timelineRef.current?.addNoteRev(note);
                    });
                }

                return true;
            } else {
                // 初回読み込み
                const initialNotes = await timelineRequestFn({
                    limit
                });

                if (initialNotes && initialNotes.length > 0) {
                    initialNotes.forEach(note => {
                        timelineRef.current?.addNoteRev(note);
                    });

                    if (timelineRef.current.initLoad) {
                        timelineRef.current.autoUpdateEnabled = true;
                        timelineRef.current.initLoad = false;
                    }
                }

                return true;
            }

        } catch (error) {
            console.error('Failed to load timeline:', error);
            throw error;
        }
    };

    const loadSkippedNotes = async (groupIndex: number) => {
        if (!timelineRef.current || loadingSkippedNotes || !apiClient) return null;

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
        if (!timelineRef.current || loadingTrimmedNotes || !apiClient) return null;

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