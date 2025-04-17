'use client';

import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { Observable } from "../Observable";
import { MisskeyStream } from "./MisskeyStream";

interface SkippedNotesGroup {
    count: number; // スキップされたノートの数
    timestamp: Date; // このグループが作られた時間
    referenceNoteId: string; // このグループがどのノートの前に表示されるか
    skippedNoteIds: string[]; // スキップされたノートのID配列
    loadedNotes: Note[] | null; // 読み込まれたノート（まだ読み込んでいなければnull）
    isLoading: boolean; // 読み込み中かどうか
}

interface TrimmedNotesGroup {
    count: number;
    timestamp: Date;
    trimmedNoteIds: string[];
    loadedNotes: Note[] | null;
    isLoading: boolean;
}

export class TimelineFeed {
    notes: Observable<Note[]>;
    misskeyApiClient: api.APIClient;
    initLoad = false;
    skippedNotesGroups: SkippedNotesGroup[] = [];
    lastSkippedGroupTimestamp: Date | null = null;
    skippedGroupThreshold = 60000;
    maxSkippedNotesToLoad = 20;
    trimmedNotesGroup: TrimmedNotesGroup | null = null;
    maxTrimmedNotesToLoad = 20;

    private misskeyStream: MisskeyStream;
    private _autoUpdateEnabled: boolean = false;

    get autoUpdateEnabled(): boolean {
        return this._autoUpdateEnabled;
    }

    set autoUpdateEnabled(value: boolean) {
        this._autoUpdateEnabled = value;
    }

    constructor(private timelineType: 'home' | 'social' | 'local' | 'global', misskeyApiClient: api.APIClient) {
        this.notes = new Observable<Note[]>([]);
        this.misskeyApiClient = misskeyApiClient;

        if (misskeyApiClient.credential == null) {
            throw Error('misskeyApiClient for TimelineFeed must have credential');
        }

        this.misskeyStream = new MisskeyStream(
            misskeyApiClient,
            timelineType,
            this.handleNewNote.bind(this)
        );
    }

    private handleNewNote(note: Note): void {
        if (this._autoUpdateEnabled) {
            console.log('auto-adding note' + note.id);
            this.addNote(note);
        } else {
            console.log('note ignored: auto-update off');
            this.addSkippedNote(note);
        }
    }

    private addSkippedNote(note: Note): void {
        const now = new Date();

        // グループのリファレンスポイント（どのノートの前に表示するか）
        const referenceNoteId = this.notes.value.length > 0
            ? this.notes.value[0].id
            : 'timeline-top';

        // 前のグループと時間が近く、同じリファレンスノートを持つ場合は同じグループに追加
        if (this.lastSkippedGroupTimestamp &&
            (now.getTime() - this.lastSkippedGroupTimestamp.getTime() < this.skippedGroupThreshold) &&
            this.skippedNotesGroups.length > 0 &&
            this.skippedNotesGroups[this.skippedNotesGroups.length - 1].referenceNoteId === referenceNoteId) {
            const lastGroup = this.skippedNotesGroups[this.skippedNotesGroups.length - 1];
            lastGroup.count += 1;
            lastGroup.timestamp = now;
            lastGroup.skippedNoteIds.push(note.id);
        } else {
            // そうでなければ新しいグループを作成
            this.skippedNotesGroups.push({
                count: 1,
                timestamp: now,
                referenceNoteId: referenceNoteId,
                skippedNoteIds: [note.id],
                loadedNotes: null,
                isLoading: false
            });
        }

        this.lastSkippedGroupTimestamp = now;

        this.notes.value = [...this.notes.value];
    }

    getSkippedNotesGroups(): SkippedNotesGroup[] {
        return this.skippedNotesGroups;
    }

    getTrimmedNotesGroup(): TrimmedNotesGroup | null {
        return this.trimmedNotesGroup;
    }

    initFeed() {
        console.log('initFeed');
        this.notes.value = [];
        this.initLoad = true;
        this._autoUpdateEnabled = false;
        // スキップされたノートグループをリセット
        this.skippedNotesGroups = [];
        this.lastSkippedGroupTimestamp = null;
        this.trimmedNotesGroup = null;
        this.misskeyStream.connect();
    }

    reloadLatest() {
        console.log('reloadLatest')
        this.notes.value = [];
        this._autoUpdateEnabled = false;
        this.initLoad = true;
        this.skippedNotesGroups = [];
        this.lastSkippedGroupTimestamp = null;
        this.trimmedNotesGroup = null;
    }

    addNote(note: Note) {
        if (this.notes.value.some(n => n.id === note.id)) {
            console.warn("duplicate note id");
            return;
        }

        const newNotes = [note, ...this.notes.value];
        this.notes.value = newNotes;
        this.misskeyStream.subscribeToNote(note.id);

        if (this.notes.value.length > 50) {
            const oldNote = this.notes.value.pop();
            if (oldNote) {
                this.misskeyStream.unsubscribeFromNote(oldNote.id);
            }
        }
    }

    addNoteRev(note: Note) {
        if (this.notes.value.some(n => n.id === note.id)) {
            console.warn("duplicate note id: " + note.id);
            return;
        }

        const newNotes = [...this.notes.value, note];
        this.notes.value = newNotes;
        this.misskeyStream.subscribeToNote(note.id);

        if (this.notes.value.length > 50) {
            const oldNote = this.notes.value.shift();
            if (oldNote) {
                this.misskeyStream.unsubscribeFromNote(oldNote.id);

                // 切り落とされたノートを記録
                if (!this.trimmedNotesGroup) {
                    this.trimmedNotesGroup = {
                        count: 1,
                        timestamp: new Date(),
                        trimmedNoteIds: [oldNote.id],
                        loadedNotes: null,
                        isLoading: false
                    };
                } else {
                    this.trimmedNotesGroup.count += 1;
                    this.trimmedNotesGroup.timestamp = new Date();
                    this.trimmedNotesGroup.trimmedNoteIds.push(oldNote.id);
                }
            }
        }
    }

    loadMore(): Promise<void> {
        const len = this.notes.value.length;
        const lastNoteId = this.notes.value[len - 1]?.id;
        const limit = 20;

        console.log(`loadmore! len: ${len} lastNoteId: ${lastNoteId}`);

        const params = {
            limit,
            untilId: lastNoteId,
        };

        let promise;
        switch (this.timelineType) {
            case 'home':
                promise = this.misskeyApiClient.request('notes/timeline', params);
                break;
            case 'social':
                promise = this.misskeyApiClient.request('notes/hybrid-timeline', params);
                break;
            case 'local':
                promise = this.misskeyApiClient.request('notes/local-timeline', params);
                break;
            case 'global':
                promise = this.misskeyApiClient.request('notes/global-timeline', params);
                break;
        }

        if (promise) {
            return promise.then(
                (notes) => {
                    notes.forEach((note) => {
                        this.addNoteRev(note);
                    });

                    if (this.initLoad) {
                        this._autoUpdateEnabled = true;
                        this.initLoad = false;
                    }
                }
            ).catch(error => {
                console.error('Failed to load more notes:', error);
                throw error;
            });
        }

        return Promise.resolve();
    }

    async loadSkippedNotes(groupIndex: number): Promise<Note[] | null> {
        const group = this.skippedNotesGroups[groupIndex];
        if (!group || group.isLoading) return null;

        // もう読み込まれているのならそれを返す
        if (group.loadedNotes) return group.loadedNotes;

        group.isLoading = true;
        this.notes.value = [...this.notes.value]; // UI を更新するため

        // 読み込むノートIDの数は制限する
        const noteIdsToLoad = group.skippedNoteIds.slice(0, this.maxSkippedNotesToLoad);

        try {
            // 1つずつノートを読み込む
            const promises = noteIdsToLoad.map(async (noteId) => {
                try {
                    const note = await this.misskeyApiClient.request('notes/show', {
                        noteId: noteId
                    });
                    if (note) {
                        return note;
                    }
                    return null;
                } catch (error) {
                    console.error(`Failed to load note ${noteId}:`, error);
                    return null;
                }
            });

            // すべての Promise を待機
            const results = await Promise.all(promises);

            // null なノートはフィルタしてはじく
            const validNotes = results.filter((note): note is Note => note !== null);

            // 読み込まれたノートを記憶
            group.loadedNotes = validNotes;
            group.isLoading = false;

            // リストを更新
            this.notes.value = [...this.notes.value];

            return group.loadedNotes;
        } catch (error) {
            console.error('Failed to load skipped notes:', error);
            group.isLoading = false;
            this.notes.value = [...this.notes.value]; // UI更新のためのトリガー
            return null;
        }
    }

    async loadTrimmedNotes(): Promise<Note[] | null> {
        const group = this.trimmedNotesGroup;
        if (!group || group.isLoading) return null;

        // すでに読み込まれている場合はそれを返す
        if (group.loadedNotes) return group.loadedNotes;

        group.isLoading = true;
        this.notes.value = [...this.notes.value]; // UI更新用

        // 読み込むノートIDの数を制限（最新の10件など）
        const noteIdsToLoad = group.trimmedNoteIds.slice(0, this.maxTrimmedNotesToLoad);

        try {
            // ノートを一括で読み込む
            const promises = noteIdsToLoad.map(async (noteId) => {
                try {
                    const note = await this.misskeyApiClient.request('notes/show', {
                        noteId: noteId
                    });
                    return note;
                } catch (error) {
                    console.error(`Failed to load note ${noteId}:`, error);
                    return null;
                }
            });

            // すべての Promise を待機
            const results = await Promise.all(promises);

            // null でないノートだけをフィルタリング
            const validNotes = results.filter((note): note is Note => note !== null);

            // 読み込まれたノートを保存
            group.loadedNotes = validNotes;
            group.isLoading = false;

            // UI更新用
            this.notes.value = [...this.notes.value];

            return group.loadedNotes;
        } catch (error) {
            console.error('Failed to load trimmed notes:', error);
            group.isLoading = false;
            this.notes.value = [...this.notes.value];
            return null;
        }
    }

    // Clean up resources when timeline is no longer needed
    cleanup() {
        this.misskeyStream.disconnect();
    }
}