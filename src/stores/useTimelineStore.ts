import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from 'misskey-js';
import { Note } from 'misskey-js/entities.js';
import { MisskeyStream } from '@/lib/misskey/MisskeyStream';

export type TimelineType = 'home' | 'social' | 'local' | 'global';

export interface SkippedNotesGroup {
    count: number;
    timestamp: Date;
    referenceNoteId: string;
    skippedNoteIds: string[];
    loadedNotes: Note[] | null;
    isLoading: boolean;
}

export interface TrimmedNotesGroup {
    count: number;
    timestamp: Date;
    trimmedNoteIds: string[];
    loadedNotes: Note[] | null;
    isLoading: boolean;
}

interface TimelineState {
    // 基本的なタイムラインの状態
    notes: Note[];
    timelineType: TimelineType;
    autoUpdateEnabled: boolean;
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string | null;

    // スキップされたノートの管理
    skippedNotesGroups: SkippedNotesGroup[];
    lastSkippedGroupTimestamp: Date | null;

    // 表示範囲外のノートの管理
    trimmedNotesGroup: TrimmedNotesGroup | null;

    // 自動更新の境界
    lastSwitchToAutoUpdateTime: Date | null;

    // MisskeyStreamインスタンス参照 (外部リソース)
    stream: MisskeyStream | null;
}

interface TimelineActions {
    // 初期化と基本操作
    initializeTimeline: (client: api.APIClient, timelineType: TimelineType) => void;
    cleanupTimeline: () => void;
    loadMoreNotes: (getTimelineFn: (params?: any) => Promise<Note[]>) => Promise<void>;

    // ノート管理
    addNote: (note: Note) => void;
    addNoteToBottom: (note: Note) => void;

    // 自動更新関連
    setAutoUpdateEnabled: (enabled: boolean) => void;

    // スキップされたノート関連
    addSkippedNote: (note: Note) => void;
    loadSkippedNotes: (groupIndex: number, getNoteFn: (noteId: string) => Promise<Note>) => Promise<Note[] | null>;

    // 表示範囲外ノート関連
    loadTrimmedNotes: (getNoteFn: (noteId: string) => Promise<Note>) => Promise<Note[] | null>;

    // タイムラインタイプ切り替え
    changeTimelineType: (newType: TimelineType) => void;

    // エラーハンドリング
    setError: (message: string) => void;
    clearError: () => void;
}

// フラグと定数
const MAX_NOTES_IN_TIMELINE = 50;
const SKIPPED_GROUP_THRESHOLD = 60000; // 60秒
const MAX_SKIPPED_NOTES_TO_LOAD = 20;
const MAX_TRIMMED_NOTES_TO_LOAD = 20;

// Zustandストア
export const useTimelineStore = create<TimelineState & TimelineActions>()(
    immer((set, get) => ({
        // 状態の初期値
        notes: [],
        timelineType: 'home',
        autoUpdateEnabled: false,
        isLoading: false,
        hasError: false,
        errorMessage: null,
        skippedNotesGroups: [],
        lastSkippedGroupTimestamp: null,
        trimmedNotesGroup: null,
        lastSwitchToAutoUpdateTime: null,
        stream: null,

        // アクション
        initializeTimeline: (client, timelineType) => {
            // リソースのクリーンアップ
            const currentStream = get().stream;
            if (currentStream) {
                currentStream.disconnect();
            }

            // 状態のリセット
            set(state => {
                state.notes = [];
                state.timelineType = timelineType;
                state.autoUpdateEnabled = false;
                state.isLoading = true;
                state.hasError = false;
                state.errorMessage = null;
                state.skippedNotesGroups = [];
                state.lastSkippedGroupTimestamp = null;
                state.trimmedNotesGroup = null;
                state.lastSwitchToAutoUpdateTime = null;

                // 新しいStreamインスタンスの作成
                if (client.credential) {
                    state.stream = new MisskeyStream(
                        client,
                        timelineType,
                        (note) => {
                            const store = get();
                            if (store.autoUpdateEnabled) {
                                store.addNote(note);
                            } else {
                                store.addSkippedNote(note);
                            }
                        }
                    );
                    state.stream.connect();
                }
            });
        },

        cleanupTimeline: () => {
            const currentStream = get().stream;
            if (currentStream) {
                currentStream.disconnect();
            }

            set(state => {
                state.stream = null;
            });
        },

        // ノートをタイムラインに追加（上部）
        addNote: (note) => {
            set(state => {
                // 重複チェック
                if (state.notes.some(n => n.id === note.id)) {
                    return;
                }

                // ノートを先頭に追加
                state.notes.unshift(note);

                // ストリーミングAPIでノート購読
                state.stream?.subscribeToNote(note.id);

                // 最大数超過時に古いノートを削除
                if (state.notes.length > MAX_NOTES_IN_TIMELINE) {
                    const oldNote = state.notes.pop();
                    if (oldNote) {
                        state.stream?.unsubscribeFromNote(oldNote.id);
                    }
                }
            });
        },

        // ノートをタイムラインに追加（下部 - 過去のノート）
        addNoteToBottom: (note) => {
            set(state => {
                // 重複チェック
                if (state.notes.some(n => n.id === note.id)) {
                    return;
                }

                // ノートを末尾に追加
                state.notes.push(note);

                // ストリーミングAPIでノート購読
                state.stream?.subscribeToNote(note.id);

                // 最大数超過時に古いノートを削除（先頭から）
                if (state.notes.length > MAX_NOTES_IN_TIMELINE) {
                    const oldNote = state.notes.shift();
                    if (oldNote) {
                        state.stream?.unsubscribeFromNote(oldNote.id);

                        // 表示範囲外になったノートを記録
                        if (!state.trimmedNotesGroup) {
                            state.trimmedNotesGroup = {
                                count: 1,
                                timestamp: new Date(),
                                trimmedNoteIds: [oldNote.id],
                                loadedNotes: null,
                                isLoading: false
                            };
                        } else {
                            state.trimmedNotesGroup.count += 1;
                            state.trimmedNotesGroup.timestamp = new Date();
                            state.trimmedNotesGroup.trimmedNoteIds.push(oldNote.id);
                        }
                    }
                }
            });
        },

        // 過去のノートをロード
        loadMoreNotes: async (getTimelineFn) => {
            const state = get();
            const lastNoteId = state.notes.length > 0
                ? state.notes[state.notes.length - 1].id
                : undefined;

            set(state => { state.isLoading = true; });

            try {
                const params = lastNoteId
                    ? { limit: 20, untilId: lastNoteId }
                    : { limit: 20 };

                const newNotes = await getTimelineFn(params);

                set(state => {
                    newNotes.forEach(note => {
                        if (!state.notes.some(n => n.id === note.id)) {
                            state.notes.push(note);
                            state.stream?.subscribeToNote(note.id);
                        }
                    });

                    // 初回ロード完了時に自動更新をオン
                    if (newNotes.length > 0 && state.notes.length <= newNotes.length) {
                        state.autoUpdateEnabled = true;
                    }

                    state.isLoading = false;
                });
            } catch (error) {
                set(state => {
                    state.hasError = true;
                    state.errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
                    state.isLoading = false;
                });
            }
        },

        // 自動更新の切り替え
        setAutoUpdateEnabled: (enabled) => {
            const currentState = get().autoUpdateEnabled;

            // 状態が変わる場合だけ処理（オフ→オン）
            if (enabled && !currentState) {
                set(state => {
                    state.autoUpdateEnabled = true;
                    state.lastSwitchToAutoUpdateTime = new Date();
                });
            }
            // オン→オフの場合
            else if (!enabled && currentState) {
                set(state => {
                    state.autoUpdateEnabled = false;
                });
            }
        },

        // スキップされたノートの追加
        addSkippedNote: (note) => {
            set(state => {
                const now = new Date();

                // リファレンスノートID（どのノートの前に表示するか）
                const referenceNoteId = state.notes.length > 0
                    ? state.notes[0].id
                    : 'timeline-top';

                // 直前のグループと時間が近く、同じリファレンスノートを持つ場合は同じグループに追加
                if (state.lastSkippedGroupTimestamp &&
                    (now.getTime() - state.lastSkippedGroupTimestamp.getTime() < SKIPPED_GROUP_THRESHOLD) &&
                    state.skippedNotesGroups.length > 0 &&
                    state.skippedNotesGroups[state.skippedNotesGroups.length - 1].referenceNoteId === referenceNoteId) {

                    const lastGroup = state.skippedNotesGroups[state.skippedNotesGroups.length - 1];
                    lastGroup.count += 1;
                    lastGroup.timestamp = now;
                    lastGroup.skippedNoteIds.push(note.id);
                } else {
                    // 新しいグループを作成
                    state.skippedNotesGroups.push({
                        count: 1,
                        timestamp: now,
                        referenceNoteId: referenceNoteId,
                        skippedNoteIds: [note.id],
                        loadedNotes: null,
                        isLoading: false
                    });
                }

                state.lastSkippedGroupTimestamp = now;
            });
        },

        // スキップされたノートのロード
        loadSkippedNotes: async (groupIndex, getNoteFn) => {
            const group = get().skippedNotesGroups[groupIndex];
            if (!group || group.isLoading || group.loadedNotes) {
                return group?.loadedNotes || null;
            }

            // ロード中状態に設定
            set(state => {
                state.skippedNotesGroups[groupIndex].isLoading = true;
            });

            try {
                // 読み込むノートIDを制限
                const noteIdsToLoad = group.skippedNoteIds.slice(0, MAX_SKIPPED_NOTES_TO_LOAD);

                // 各ノートを並列で取得
                const promises = noteIdsToLoad.map(async (noteId) => {
                    try {
                        return await getNoteFn(noteId);
                    } catch (error) {
                        console.error(`Failed to load note ${noteId}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validNotes = results.filter((note): note is Note => note !== null);

                // 結果を状態に保存
                set(state => {
                    state.skippedNotesGroups[groupIndex].loadedNotes = validNotes;
                    state.skippedNotesGroups[groupIndex].isLoading = false;
                });

                return validNotes;
            } catch (error) {
                console.error('Failed to load skipped notes:', error);

                set(state => {
                    state.skippedNotesGroups[groupIndex].isLoading = false;
                });

                return null;
            }
        },

        // 表示範囲外ノートのロード
        loadTrimmedNotes: async (getNoteFn) => {
            const group = get().trimmedNotesGroup;
            if (!group || group.isLoading || group.loadedNotes) {
                return group?.loadedNotes || null;
            }

            // ロード中状態に設定
            set(state => {
                if (state.trimmedNotesGroup) {
                    state.trimmedNotesGroup.isLoading = true;
                }
            });

            try {
                // 読み込むノートIDを制限
                const noteIdsToLoad = group.trimmedNoteIds.slice(0, MAX_TRIMMED_NOTES_TO_LOAD);

                // 各ノートを並列で取得
                const promises = noteIdsToLoad.map(async (noteId) => {
                    try {
                        return await getNoteFn(noteId);
                    } catch (error) {
                        console.error(`Failed to load note ${noteId}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validNotes = results.filter((note): note is Note => note !== null);

                // 結果を状態に保存
                set(state => {
                    if (state.trimmedNotesGroup) {
                        state.trimmedNotesGroup.loadedNotes = validNotes;
                        state.trimmedNotesGroup.isLoading = false;
                    }
                });

                return validNotes;
            } catch (error) {
                console.error('Failed to load trimmed notes:', error);

                set(state => {
                    if (state.trimmedNotesGroup) {
                        state.trimmedNotesGroup.isLoading = false;
                    }
                });

                return null;
            }
        },

        // タイムラインタイプの変更
        changeTimelineType: (newType) => {
            const currentType = get().timelineType;

            if (currentType === newType) {
                return; // 同じタイプなら何もしない
            }

            // 現在のStreamをクリーンアップ
            const currentStream = get().stream;
            if (currentStream) {
                currentStream.disconnect();
            }

            // 状態をリセット
            set(state => {
                state.notes = [];
                state.timelineType = newType;
                state.autoUpdateEnabled = false;
                state.skippedNotesGroups = [];
                state.lastSkippedGroupTimestamp = null;
                state.trimmedNotesGroup = null;
                state.lastSwitchToAutoUpdateTime = null;
                state.stream = null;
            });
        },

        // エラー状態の設定
        setError: (message) => {
            set(state => {
                state.hasError = true;
                state.errorMessage = message;
            });
        },

        // エラー状態のクリア
        clearError: () => {
            set(state => {
                state.hasError = false;
                state.errorMessage = null;
            });
        }
    }))
);