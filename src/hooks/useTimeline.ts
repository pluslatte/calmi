import { useCallback, useEffect, useState } from 'react';
import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { TimelineType } from '@/lib/misskey/api/TimelineApi';
import { useTimelineData } from './useTimelineData';
import { useTimelineBuffering } from './useTimelineBuffering';

export function useTimeline(timelineType: TimelineType, apiClient: api.APIClient) {
    // データ管理用の状態
    const {
        notes: dataNotes,
        isLoading,
        loadMore,
        refresh
    } = useTimelineData(timelineType, apiClient);

    // バッファリング用の状態
    const {
        buffer,
        isBuffering,
        enableBuffering,
        disableBuffering,
        addToBuffer,
        flushBuffer
    } = useTimelineBuffering();

    // 表示用のノート（バッファリング状態によって変わる）
    const [displayNotes, setDisplayNotes] = useState<Note[]>([]);

    // dataNotesが変更されたらdisplayNotesも更新
    useEffect(() => {
        if (!isBuffering) {
            setDisplayNotes(dataNotes);
        }
    }, [dataNotes, isBuffering]);

    // バッファをフラッシュして表示ノートを更新
    const disableBufferingAndFlush = useCallback(() => {
        disableBuffering();
        const bufferedNotes = flushBuffer();

        // バッファ内のノートを表示ノートに統合
        setDisplayNotes(prev => {
            // バッファ内のノートとdataNotesを重複なしで結合
            const combinedNotes = [...bufferedNotes];

            // 既存の表示ノートで、バッファに含まれていないものを追加
            dataNotes.forEach(note => {
                if (!combinedNotes.some(n => n.id === note.id)) {
                    combinedNotes.push(note);
                }
            });

            // 作成日時でソート
            return combinedNotes.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        });
    }, [disableBuffering, flushBuffer, dataNotes]);

    // 自動更新の制御関数
    const setAutoUpdateFeed = useCallback((enable: boolean) => {
        if (enable) {
            disableBufferingAndFlush();
        } else {
            enableBuffering();
        }
    }, [disableBufferingAndFlush, enableBuffering]);

    return {
        notes: displayNotes,
        buffer,
        isLoading,
        isBuffering,
        loadMore,
        refresh,
        enableBuffering,
        disableBufferingAndFlush,
        setAutoUpdateFeed
    };
}