import { TimelineType } from "@/lib/misskey/api/TimelineApi";
import { TimelineStream } from "@/lib/misskey/stream/TimelineStream";
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef, useState } from "react";

export function useTimelineData(timelineType: TimelineType, apiClient: api.APIClient) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // TimelineStream インスタンスの保持
    const streamRef = useRef<TimelineStream | null>(null);

    // timelineType の変更に合わせてストリームを初期化しなおす
    useEffect(() => {
        const stream = new TimelineStream(apiClient);
        streamRef.current = stream;

        // タイムラインへの接続と、イベントハンドラの設定
        stream.connect(timelineType, (note) => {
            setNotes((prevNotes) => {
                // 重複のチェック
                if (prevNotes.some(n => n.id === note.id)) {
                    return prevNotes;
                }
                // 新しいノートを先頭へ追加
                return [note, ...prevNotes];
            });

            stream.subscribeToNote(note.id);
        });

        // 初期データロード
        loadInitial();

        // クリーンアップ関数を返す
        return () => {
            stream.disconnect();
        };
    }, [timelineType, apiClient]);

    const loadInitial = async () => {
        setIsLoading(true);
        try {
            let initialNotes: Note[] = [];

            switch (timelineType) {
                case 'home':
                    initialNotes = await apiClient.request('notes/timeline', { limit: 20 });
                    break;
                case 'social':
                    initialNotes = await apiClient.request('notes/hybrid-timeline', { limit: 20 });
                    break;
                case 'local':
                    initialNotes = await apiClient.request('notes/local-timeline', { limit: 20 });
                    break;
                case 'global':
                    initialNotes = await apiClient.request('notes/global-timeline', { limit: 20 });
                    break;
            }

            setNotes(initialNotes);
            initialNotes.forEach(note => {
                streamRef.current?.subscribeToNote(note.id);
            });

            setHasMore(initialNotes.length >= 20);
        } catch (error) {
            console.error('failed to load initial timeline', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = async () => {
        if (isLoading || !hasMore || notes.length === 0) return;

        setIsLoading(true);
        try {
            const lastNoteId = notes[notes.length - 1]?.id;
            if (!lastNoteId) return;

            let moreNotes: Note[] = [];

            switch (timelineType) {
                case 'home':
                    moreNotes = await apiClient.request('notes/timeline', {
                        limit: 20,
                        untilId: lastNoteId
                    });
                    break;
                case 'social':
                    moreNotes = await apiClient.request('notes/hybrid-timeline', {
                        limit: 20,
                        untilId: lastNoteId
                    });
                    break;
                case 'local':
                    moreNotes = await apiClient.request('notes/local-timeline', {
                        limit: 20,
                        untilId: lastNoteId
                    });
                    break;
                case 'global':
                    moreNotes = await apiClient.request('notes/global-timeline', {
                        limit: 20,
                        untilId: lastNoteId
                    });
                    break;
            }

            moreNotes.forEach(note => {
                streamRef.current?.subscribeToNote(note.id);
            });

            if (moreNotes.length > 0) {
                setNotes((prevNotes) => [...prevNotes, ...moreNotes]);
                setHasMore(moreNotes.length >= 20);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('failed to load more notes', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        notes,
        isLoading,
        hasMore,
        loadMore,
        refresh: loadInitial
    };
}