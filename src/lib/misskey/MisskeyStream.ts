'use client';

import { api, Stream } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { Connection } from "misskey-js/streaming.js";

type TimelineType = 'home' | 'social' | 'local' | 'global';

export class MisskeyStream {
    private stream: Stream;
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

    constructor(
        misskeyApiClient: api.APIClient,
        private timelineType: TimelineType,
        private onNewNote: (note: Note) => void
    ) {
        if (misskeyApiClient.credential == null) {
            throw Error('misskeyApiClient must have credential');
        }
        this.stream = new Stream(misskeyApiClient.origin, { token: misskeyApiClient.credential });
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
            console.log('channel: new note: ' + note.id);
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