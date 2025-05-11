'use client';

import { api, Stream } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { Connection } from "misskey-js/streaming.js";
import { NoteUpdatedEvent } from "misskey-js/streaming.types.js";
import { TimelineType } from "@/types/misskey.types";

export class MisskeyStream {
    private stream: Stream;
    private apiClient: api.APIClient;
    private channel: Connection<{
        params: {
            withRenotes?: boolean;
            withFiles?: boolean;
        };
        events: {
            note: (payload: Note) => void;
        };
        receives: null;
    }> | null = null;
    private subscribedNoteIds: Set<string> = new Set();
    private onNoteUpdated: ((event: NoteUpdatedEvent) => void) | null = null;
    private updateRenoteSource: ((note: Note) => void) | null = null;
    private onNoteDeleted: ((event: NoteUpdatedEvent) => void) | null = null;

    constructor(
        misskeyApiClient: api.APIClient,
        private timelineType: TimelineType,
        private onNewNote: (note: Note) => void,
        noteUpdateCallback?: (event: NoteUpdatedEvent) => void,
        renoteSourceUpdateCallback?: (note: Note) => void,
        noteDeletedCallback?: (event: NoteUpdatedEvent) => void,
    ) {
        if (misskeyApiClient.credential == null) {
            throw Error('misskeyApiClient must have credential');
        }
        this.apiClient = misskeyApiClient;
        this.stream = new Stream(misskeyApiClient.origin, { token: misskeyApiClient.credential });
        if (noteUpdateCallback) {
            this.onNoteUpdated = noteUpdateCallback;
        }
        if (renoteSourceUpdateCallback) {
            this.updateRenoteSource = renoteSourceUpdateCallback;
        }
        if (noteDeletedCallback) {
            this.onNoteDeleted = noteDeletedCallback;
        }
    }

    connect(): void {
        switch (this.timelineType) {
            case 'home':
                this.channel = this.stream.useChannel('homeTimeline');
                break;
            case 'social':
                this.channel = this.stream.useChannel('hybridTimeline');
                break;
            case 'local':
                this.channel = this.stream.useChannel('localTimeline');
                break;
            case 'global':
                this.channel = this.stream.useChannel('globalTimeline');
                break;
        }

        this.channel.on('note', (note: Note) => {
            // console.log('channel: new note: ' + note.id);
            this.onNewNote(note);
        });
    }

    disconnect(): void {
        this.stream.close();
        this.channel = null;
    }

    subscribeToNote(noteId: string): void {
        if (!this.subscribedNoteIds.has(noteId)) {
            this.stream.send('subNote', { id: noteId });
            this.subscribedNoteIds.add(noteId);

            // リアクションイベントの購読
            this.stream.on('noteUpdated', (data: { id: string; type: string; body: Record<string, unknown> }) => {
                if (data.id === noteId) {
                    // ノート更新時にコールバックを呼び出す
                    if ((data.type === 'reacted' || data.type === 'unreacted') && this.onNoteUpdated) {
                        // 型に応じてbodyをキャスト
                        const event = {
                            id: noteId,
                            type: data.type,
                            body: data.body as any
                        } as NoteUpdatedEvent;
                        
                        // ノート情報を取得して更新
                        this.onNoteUpdated(event);

                        // リノート元ノートとして使われている場合も更新
                        if (this.updateRenoteSource) {
                            // ノート情報を取得（APIクライアントが必要）
                            this.apiClient.request('notes/show', { noteId })
                                .then((updatedNote: Note) => {
                                    this.updateRenoteSource!(updatedNote);
                                })
                                .catch(err => {
                                    console.error('Failed to fetch updated note:', err);
                                });
                        }
                    }

                    // ノート削除イベントの処理
                    if (data.type === 'deleted' && this.onNoteDeleted) {
                        const deleteEvent = {
                            id: noteId,
                            type: 'deleted' as const,
                            body: data.body as any
                        } as NoteUpdatedEvent;
                        
                        this.onNoteDeleted(deleteEvent);
                    }
                }
            });
        }
    }

    unsubscribeFromNote(noteId: string): void {
        if (this.subscribedNoteIds.has(noteId)) {
            this.stream.send('unsubNote', { id: noteId });
            this.subscribedNoteIds.delete(noteId);
        }
    }

    getStream(): Stream {
        return this.stream;
    }
}