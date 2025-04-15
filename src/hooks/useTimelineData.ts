import { useState, useEffect, useRef } from 'react';
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { TimelineType } from '@/lib/misskey/api/TimelineApi';
import { TimelineStream } from '@/lib/misskey/stream/TimelineStream';

export function useTimelineData(timelineType: TimelineType, apiClient: api.APIClient) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const streamRef = useRef<TimelineStream | null>(null);

    // APIクライアントが変更されたときだけ初期化するように修正
    const apiClientRef = useRef(apiClient);

    // 初期データ読み込み関数
    const loadInitial = async () => {
        if (!apiClient || !apiClient.credential) return;

        setIsLoading(true);
        try {
            // タイムラインタイプに応じて明示的にエンドポイントを指定
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
            console.error('Failed to load initial timeline', error);
        } finally {
            setIsLoading(false);
        }
    };

    // さらに読み込み関数
    const loadMore = async () => {
        if (isLoading || !hasMore || notes.length === 0 || !apiClient) return;

        setIsLoading(true);
        try {
            const lastNoteId = notes[notes.length - 1]?.id;
            if (!lastNoteId) return;

            // タイムラインタイプに応じて明示的にエンドポイントを指定
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

            // 新しく取得したノートを購読
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
            console.error('Failed to load more notes', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // APIクライアントが無効なら何もしない
        if (!apiClient || !apiClient.credential) {
            console.log('Invalid API client, skipping timeline initialization');
            return;
        }

        try {
            console.log('Initializing timeline stream');
            const stream = new TimelineStream(apiClient);
            streamRef.current = stream;

            // タイムライン接続とイベントハンドラの設定
            stream.connect(timelineType, (note) => {
                setNotes((prevNotes) => {
                    // 重複チェック
                    if (prevNotes.some(n => n.id === note.id)) {
                        return prevNotes;
                    }
                    // 新しいノートを先頭に追加
                    return [note, ...prevNotes];
                });

                // 新しいノートを購読
                stream.subscribeToNote(note.id);
            });

            // 初期データロード
            loadInitial();

            // クリーンアップ関数
            return () => {
                console.log('Cleaning up timeline stream');
                stream.disconnect();
            };
        } catch (error) {
            console.error('Error setting up timeline:', error);
        }
    }, [timelineType, apiClient?.origin, apiClient?.credential]);

    return {
        notes,
        isLoading,
        hasMore,
        loadMore,
        refresh: loadInitial
    };
}