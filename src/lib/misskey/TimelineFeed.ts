'use client';

import { api, note, Stream } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { Connection } from "misskey-js/streaming.js";

export class TimelineFeed {
    private _notes: Note[] = [];
    onNotesChange: () => void;
    misskeyApiClient: api.APIClient;
    stream: Stream;
    doAutoUpdateFeed = false;
    initLoad = false;

    get notes(): Note[] {
        return this._notes;
    }

    set notes(newValue: Note[]) {
        if (this._notes !== newValue) {
            this._notes = newValue;
            this.onNotesChange();
        }
    }

    constructor(private timelineType: 'home' | 'social' | 'local' | 'global', misskeyApiClient: api.APIClient, onNotesChange: () => void) {
        this.onNotesChange = onNotesChange;
        this.misskeyApiClient = misskeyApiClient;
        if (misskeyApiClient.credential == null) {
            throw Error('misskeyApiClient for TimelineFeed must have credential');
        }
        this.stream = new Stream(misskeyApiClient.origin, { token: misskeyApiClient.credential })
    }

    initFeed() {
        console.log('initFeed');
        this.notes = [];
        this.initLoad = true;
        this.loadMore();
        this.setChannel();
    }

    addNote(note: Note) {
        console.log(`addNote: ${note.id}`);
        const newNotes = [note, ...this.notes];
        this.notes = newNotes;
        this.stream.send('subNote', { id: note.id });
        if (this.notes.length > 50) {
            const oldNote = this.notes.pop();
            if (oldNote) {
                this.stream.send('unsubNote', { id: oldNote.id });
            }
        }
    }
    setChannel() {
        let channel: Connection<{
            params: {
                withRenotes?: boolean;
                withFiles?: boolean;
            };
            events: {
                note: (payload: Note) => void;
            };
            receives: null;
        }>;

        switch (this.timelineType) {
            case 'home':
                channel = this.stream.useChannel('homeTimeline');
                break;
            case 'social':
                channel = this.stream.useChannel('hybridTimeline');
                break;
            case 'local':
                channel = this.stream.useChannel('localTimeline');
                break;
            case 'global':
                channel = this.stream.useChannel('globalTimeline');
                break;
        }

        channel.on('note', (note: Note) => {
            if (this.doAutoUpdateFeed) {
                this.addNote(note);
            }
        });
    }

    loadMore() {
        const lastNoteId = this.notes[this.notes.length - 1]?.id;
        const limit = 20;

        switch (this.timelineType) {
            case 'home':
                this.misskeyApiClient.request('notes/timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then((notes) => {
                    notes.forEach((note) => {
                        this.addNote(note);
                    })
                });
                break;
            case 'social':
                this.misskeyApiClient.request('notes/hybrid-timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then((notes) => {
                    notes.forEach((note) => {
                        this.addNote(note);
                    })
                });
                break;
            case 'local':
                this.misskeyApiClient.request('notes/local-timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then((notes) => {
                    notes.forEach((note) => {
                        this.addNote(note);
                    })
                });
                break;
            case 'global':
                this.misskeyApiClient.request('notes/global-timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then((notes) => {
                    notes.forEach((note) => {
                        this.addNote(note);
                    })
                });
                break;
        }


        if (this.initLoad) {
            this.doAutoUpdateFeed = true;
            this.initLoad = false;
        }
    }
}