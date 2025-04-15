import { Note } from "misskey-js/entities.js";
import { useState } from "react";

export function useTimelineBuffering() {
    const [buffer, setBuffer] = useState<Note[]>([]);
    const [isBuffering, setIsBuffering] = useState(false);

    const enableBuffering = () => {
        setIsBuffering(true);
    };

    // バッファリングを無効化
    const disableBuffering = () => {
        setIsBuffering(false);
    };

    // ノートをバッファに追加
    const addToBuffer = (note: Note) => {
        if (isBuffering) {
            // 重複チェック
            setBuffer((prev) => {
                if (prev.some(n => n.id === note.id)) {
                    return prev;
                }
                return [note, ...prev];
            });
            return true; // バッファに追加されたことを示す
        }
        return false; // バッファリングが無効なので追加されなかった
    };

    // バッファをフラッシュして内容を返す
    const flushBuffer = () => {
        const bufferedNotes = [...buffer];
        setBuffer([]);
        return bufferedNotes;
    };

    return {
        buffer,
        isBuffering,
        enableBuffering,
        disableBuffering,
        addToBuffer,
        flushBuffer
    };
}