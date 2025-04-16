'use client';

import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { Observable } from "../Observable";
import { MisskeyStream } from "./MisskeyStream";

export class TimelineFeed {
    notes: Observable<Note[]>;
    private readonly misskeyApiClient: api.APIClient;
    private readonly misskeyStream: MisskeyStream;
    private newNotesBuffer: Note[] = [];

    private _isAutoUpdateEnabled = true;
    private _isBufferingEnabled = false;
    private _isInitialLoading = true;

    private readonly MAX_NOTES = 50;
    private readonly LOAD_LIMIT = 20;
    private readonly MIN_BUFFER_SIZE = 10;

    constructor(private timelineType: 'home' | 'social' | 'local' | 'global', apiClient: api.APIClient) {
        this.notes = new Observable<Note[]>([]);
        this.misskeyApiClient = apiClient;

        if (!apiClient.credential) {
            throw Error('misskeyApiClient for TimelineFeed must have credential');
        }

        this.misskeyStream = new MisskeyStream(
            apiClient,
            timelineType,
            this.handleNewNote.bind(this)
        );
    }

    get isAutoUpdateEnabled(): boolean {
        return this._isAutoUpdateEnabled;
    }

    set isAutoUpdateEnabled(value: boolean) {
        this._isAutoUpdateEnabled = value;
        // 自動更新がONになったら、バッファリングを無効化する
        if (value && this._isBufferingEnabled) {
            this.disableBufferingAndFlush();
        }
    }

    get isBufferingEnabled(): boolean {
        return this._isBufferingEnabled;
    }

    get isInitialLoading(): boolean {
        return this._isInitialLoading;
    }

    initFeed() {
        console.log('initFeed');
        this.notes.value = [];
        this._isInitialLoading = true;
        this.misskeyStream.connect();
    }

    private handleNewNote(note: Note): void {
        if (this._isBufferingEnabled) {
            console.log('bufferEnabled ' + note.id);
            this.newNotesBuffer.unshift(note);
        } else if (this._isAutoUpdateEnabled) {
            console.log('bufferDisabled ' + note.id);
            this.addNote(note);
        }
    }

    reloadLatest() {
        this.notes.value = [];
        this._isAutoUpdateEnabled = false;
        this._isInitialLoading = true;
    }

    addNote(note: Note) {
        if (this.notes.value.some(n => n.id === note.id)) {
            console.warn("duplicate note id");
            return;
        }

        const newNotes = [note, ...this.notes.value];
        this.notes.value = newNotes;
        this.misskeyStream.subscribeToNote(note.id);

        this.trimNotesIfNeeded();
    }

    addNoteRev(note: Note) {
        if (this.notes.value.some(n => n.id === note.id)) {
            console.warn("duplicate note id: " + note.id);
            return;
        }

        const newNotes = [...this.notes.value, note];
        this.notes.value = newNotes;
        this.misskeyStream.subscribeToNote(note.id);

        this.trimNotesIfNeededRev();
    }

    // ノート数上限を超えたら下の方のノートは削除
    private trimNotesIfNeeded(): void {
        if (this.notes.value.length > this.MAX_NOTES) {
            // リストに追加するノートが先頭に行く状態なら、末尾のノートを削除
            const oldNote = this.notes.value.pop();
            if (oldNote) {
                this.misskeyStream.unsubscribeFromNote(oldNote.id);
            }
        }
    }

    // ノート数上限を超えたら上の方のノートは削除
    private trimNotesIfNeededRev(): void {
        if (this.notes.value.length > this.MAX_NOTES) {
            // リストに追加するノートが末尾に行く状態なら、先頭のノートを削除
            const oldNote = this.notes.value.shift();
            if (oldNote) {
                this.misskeyStream.unsubscribeFromNote(oldNote.id);
            }
        }
    }

    loadMore() {
        const len = this.notes.value.length;
        const lastNoteId = len > 0 ? this.notes.value[len - 1]?.id : undefined;

        console.log(`loadmore! len: ${len} lastNoteId: ${lastNoteId}`);

        const params: any = {
            limit: this.LOAD_LIMIT
        };

        if (lastNoteId) {
            params.untilId = lastNoteId;
        }

        switch (this.timelineType) {
            case 'home':
                this.misskeyApiClient.request('notes/timeline', params)
                    .then((notes: Note[]) => {
                        notes.forEach(note => this.addNoteRev(note));

                        if (this._isInitialLoading) {
                            this._isAutoUpdateEnabled = true;
                            this._isInitialLoading = false;
                        }
                    }).catch(error => {
                        console.error(`Failed to load ${this.timelineType} timeline:`, error);
                    });
                break;
            case 'social':
                this.misskeyApiClient.request('notes/hybrid-timeline', params)
                    .then((notes: Note[]) => {
                        notes.forEach(note => this.addNoteRev(note));

                        if (this._isInitialLoading) {
                            this._isAutoUpdateEnabled = true;
                            this._isInitialLoading = false;
                        }
                    }).catch(error => {
                        console.error(`Failed to load ${this.timelineType} timeline:`, error);
                    });
                break;
            case 'local':
                this.misskeyApiClient.request('notes/local-timeline', params)
                    .then((notes: Note[]) => {
                        notes.forEach(note => this.addNoteRev(note));

                        if (this._isInitialLoading) {
                            this._isAutoUpdateEnabled = true;
                            this._isInitialLoading = false;
                        }
                    }).catch(error => {
                        console.error(`Failed to load ${this.timelineType} timeline:`, error);
                    });
                break;
            case 'global':
                this.misskeyApiClient.request('notes/global-timeline', params)
                    .then((notes: Note[]) => {
                        notes.forEach(note => this.addNoteRev(note));

                        if (this._isInitialLoading) {
                            this._isAutoUpdateEnabled = true;
                            this._isInitialLoading = false;
                        }
                    }).catch(error => {
                        console.error(`Failed to load ${this.timelineType} timeline:`, error);
                    });
                break;
        }
    }

    // バッファされたノートをメインリストへ
    private flushBufferedNotes(): void {
        // 現在のノートは全て購読解除
        this.notes.value.forEach(note => {
            console.log("unsubscribe note: " + note.id);
            this.misskeyStream.unsubscribeFromNote(note.id);
        });

        // メインリストを全てバッファで置き換え
        this.notes.value = [...this.newNotesBuffer];

        // 新しく入ってきたノートは購読
        this.newNotesBuffer.forEach(note => {
            this.misskeyStream.subscribeToNote(note.id);
        });

        // バッファが少なかったら、追加でノートをロードする
        if (this.newNotesBuffer.length < this.MIN_BUFFER_SIZE) {
            this.loadMore();
        }

        // バッファはクリアする
        this.newNotesBuffer = [];
    }

    enableBuffering() {
        this._isBufferingEnabled = true;
    }

    disableBufferingAndFlush() {
        this._isBufferingEnabled = false;
        this.flushBufferedNotes();
    }

    // Clean up resources when timeline is no longer needed
    cleanup() {
        this.misskeyStream.disconnect();
    }
}