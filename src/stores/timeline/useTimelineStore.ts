import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from 'misskey-js';
import { Note } from 'misskey-js/entities.js';
import { MisskeyStream } from '@/lib/misskey/MisskeyStream';
import { NoteUpdatedEvent } from "misskey-js/streaming.types.js";
import { TimelineType } from "@/types/misskey.types";

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

    // キー: リノート元ID, 値: そのリノートを含むノートIDの配列
    renoteRelationMap: Record<string, string[]>;
}

interface TimelineActions {
    // 初期化と基本操作
    initializeTimeline: (client: api.APIClient, timelineType: TimelineType) => string;
    cleanupTimeline: () => void;
    loadMoreNotes: (getTimelineFn: (params?: any) => Promise<Note[]>) => Promise<void>;

    // ノート管理
    addNoteOnTop: (note: Note) => void;
    removeNoteFromTimeline: (noteId: string) => void;

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

    // ノート情報のアップデート
    updateNoteInTimeline: (updatedNote: Note) => void;
    updateRenoteSource: (updatedNote: Note) => void;
}

// フラグと定数
const MAX_NOTES_IN_TIMELINE = 100;
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
        renoteRelationMap: {},

        // アクション
        initializeTimeline: (client, timelineType): string => {
            // ローカルストレージからタイムラインタイプを読み込み
            let savedType = timelineType;
            try {
                const saved = localStorage.getItem('calmi_timeline_type') as TimelineType | null;
                if (saved && ['home', 'social', 'local', 'global'].includes(saved)) {
                    savedType = saved;
                }
            } catch (error) {
                console.error('Failed to load timeline type from localStorage:', error);
            }

            // リソースのクリーンアップ
            const currentStream = get().stream;
            if (currentStream) {
                currentStream.disconnect();
            }

            // ノート更新イベントのハンドラ
            const handleNoteUpdated = (event: NoteUpdatedEvent) => {
                if (client && (event.type === 'reacted' || event.type === 'unreacted')) {
                    client.request('notes/show', { noteId: event.id })
                        .then((updatedNote: Note) => {
                            // ノート情報を更新
                            get().updateNoteInTimeline(updatedNote);
                        })
                        .catch(error => {
                            console.error('Failed to fetch updated note:', error);
                        });
                }
            };

            // ノート削除イベントのハンドラ
            const handleNoteDeleted = (event: NoteUpdatedEvent) => {
                // タイムラインからノートを削除
                get().removeNoteFromTimeline(event.id);
                console.log(`Note deleted from timeline: ${event.id}`);
            };

            // 状態のリセット
            set(state => {
                state.notes = [];
                state.timelineType = savedType; // ここで savedType を使用
                state.autoUpdateEnabled = false;
                state.isLoading = true;
                state.hasError = false;
                state.errorMessage = null;
                state.skippedNotesGroups = [];
                state.lastSkippedGroupTimestamp = null;
                state.trimmedNotesGroup = null;
                state.lastSwitchToAutoUpdateTime = null;
                state.renoteRelationMap = {};

                // 新しいStreamインスタンスの作成
                if (client.credential) {
                    state.stream = new MisskeyStream(
                        client,
                        savedType, // ここでも savedType を使用
                        (note) => {
                            const store = get();
                            if (store.autoUpdateEnabled) {
                                store.addNoteOnTop(note);
                            } else {
                                store.addSkippedNote(note);
                            }
                        },
                        handleNoteUpdated,
                        (updatedNote) => { get().updateRenoteSource(updatedNote); },
                        handleNoteDeleted // 削除イベントハンドラを追加
                    );
                    state.stream.connect();
                }
            });

            // 状態更新が確実に完了した後に返す
            return savedType; // savedType を返すように変更
        },

        cleanupTimeline: () => {
            const notes = get().notes;
            const currentStream = get().stream;
            const renoteRelationMap = get().renoteRelationMap;
            if (currentStream) {
                // 現在のタイムラインのすべてのノートの購読を解除
                notes.forEach(note => {
                    currentStream.unsubscribeFromNote(note.id);
                    if (note.renote) {
                        currentStream.unsubscribeFromNote(note.renote.id);
                    }
                });

                // リノート元ノートの購読も解除
                Object.keys(renoteRelationMap).forEach(renoteId => {
                    currentStream.unsubscribeFromNote(renoteId);
                });

                // ストリームを切断
                currentStream.disconnect();
            }

            set(state => {
                state.stream = null;
            });
        },

        // ノートをタイムラインに追加（上部）
        addNoteOnTop: (note) => {
            set(state => {
                // 重複チェック
                if (state.notes.some(n => n.id === note.id)) {
                    return;
                }

                // ノートを先頭に追加
                state.notes.unshift(note);

                // ストリーミングAPIでノート購読
                state.stream?.subscribeToNote(note.id);

                // リノートがあるならば、それも購読し、関連付けを記録
                if (note.renote) {
                    const renoteId = note.renote.id;
                    state.stream?.subscribeToNote(note.renote.id);

                    // 関連マップに登録
                    if (!state.renoteRelationMap[renoteId]) {
                        // その Id に結びついた string[] が空なら、まず空配列で初期化
                        state.renoteRelationMap[renoteId] = [];
                    }
                    if (!state.renoteRelationMap[renoteId].includes(note.id)) {
                        // string[] に該当するノートが見つからなければ登録
                        state.renoteRelationMap[renoteId].push(note.id);
                    }
                }

                // 最大数超過時に古いノートを削除
                if (state.notes.length > MAX_NOTES_IN_TIMELINE) {
                    const oldNote = state.notes.pop();
                    if (oldNote) {
                        state.stream?.unsubscribeFromNote(oldNote.id);

                        // リノートの関連付けも削除
                        if (oldNote.renote) {
                            const renoteId = oldNote.renote.id;
                            state.stream?.unsubscribeFromNote(renoteId);

                            // 関連マップから削除
                            if (state.renoteRelationMap[renoteId]) {
                                state.renoteRelationMap[renoteId] = state.renoteRelationMap[renoteId]
                                    .filter(id => id !== oldNote.id);

                                // 空になったら項目自体を削除
                                if (state.renoteRelationMap[renoteId].length === 0) {
                                    delete state.renoteRelationMap[renoteId];
                                }
                            }
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
                    ? { limit: 40, untilId: lastNoteId }
                    : { limit: 40 };

                const newNotes = await getTimelineFn(params);

                set(state => {
                    newNotes.forEach(note => {
                        if (!state.notes.some(n => n.id === note.id)) {
                            state.notes.push(note);
                            // ノートを購読
                            state.stream?.subscribeToNote(note.id);

                            // リノートがある場合は購読し、関連付けを記録
                            if (note.renote) {
                                const renoteId = note.renote.id;
                                state.stream?.subscribeToNote(renoteId);

                                // 関連マップに追加
                                if (!state.renoteRelationMap[renoteId]) {
                                    state.renoteRelationMap[renoteId] = [];
                                }
                                if (!state.renoteRelationMap[renoteId].includes(note.id)) {
                                    state.renoteRelationMap[renoteId].push(note.id);
                                }
                            }
                        }

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

            // タイムラインタイプをローカルストレージに保存
            try {
                localStorage.setItem('calmi_timeline_type', newType);
            } catch (error) {
                console.error('Failed to save timeline type to localStorage:', error);
            }
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
        },

        // ノート情報を更新するアクション
        updateNoteInTimeline: (updatedNote: Note) => {
            set(state => {
                const index = state.notes.findIndex(note => note.id === updatedNote.id);
                if (index !== -1) {
                    state.notes[index] = updatedNote;
                } else {
                    console.warn('the specified note to update does not exist')
                }
            });
        },

        // リノート元ノートの更新処理
        updateRenoteSource: (updatedNote: Note) => {
            const state = get();
            const relationIds = state.renoteRelationMap[updatedNote.id] || [];

            // この更新されたノートをリノートしているノートがあれば、それら全てを更新
            if (relationIds.length > 0) {
                set(state => {
                    // リノートしているノートそれぞれについて処理
                    relationIds.forEach(noteId => {
                        const noteIndex = state.notes.findIndex(n => n.id === noteId);
                        if (noteIndex !== -1) {
                            // ノートのrenoteプロパティを更新
                            state.notes[noteIndex].renote = updatedNote;
                        }
                    });
                });
            }
        },

        // タイムラインからノートを削除するアクション
        removeNoteFromTimeline: (noteId: string) => {
            set(state => {
                // ノートを配列から削除
                const noteIndex = state.notes.findIndex(note => note.id === noteId);
                if (noteIndex !== -1) {
                    // ノートの購読を解除
                    const noteToRemove = state.notes[noteIndex];
                    state.stream?.unsubscribeFromNote(noteToRemove.id);

                    // リノートの場合は関連マップも更新
                    if (noteToRemove.renote) {
                        const renoteId = noteToRemove.renote.id;

                        // 関連マップから削除
                        if (state.renoteRelationMap[renoteId]) {
                            state.renoteRelationMap[renoteId] = state.renoteRelationMap[renoteId]
                                .filter(id => id !== noteToRemove.id);

                            // 空になったら項目自体を削除
                            if (state.renoteRelationMap[renoteId].length === 0) {
                                delete state.renoteRelationMap[renoteId];
                                // リノート元の購読も解除（他に参照がなければ）
                                state.stream?.unsubscribeFromNote(renoteId);
                            }
                        }
                    }

                    // スキップされたノートグループからも削除
                    state.skippedNotesGroups.forEach(group => {
                        const skipIndex = group.skippedNoteIds.indexOf(noteId);
                        if (skipIndex !== -1) {
                            group.skippedNoteIds.splice(skipIndex, 1);
                            group.count -= 1;
                        }
                    });

                    // 表示範囲外ノートからも削除
                    if (state.trimmedNotesGroup) {
                        const trimIndex = state.trimmedNotesGroup.trimmedNoteIds.indexOf(noteId);
                        if (trimIndex !== -1) {
                            state.trimmedNotesGroup.trimmedNoteIds.splice(trimIndex, 1);
                            state.trimmedNotesGroup.count -= 1;
                        }
                    }

                    // タイムラインから削除
                    state.notes.splice(noteIndex, 1);
                }
            });
        }
    }))
);