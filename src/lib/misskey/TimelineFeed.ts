'use client';

import { api, Stream } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { Connection } from "misskey-js/streaming.js";
import { Observable } from "../Observable";

export class TimelineFeed {
    notes: Observable<Note[]>;
    misskeyApiClient: api.APIClient;
    stream: Stream;
    doAutoUpdateFeed = false;
    initLoad = false;

    constructor(private timelineType: 'home' | 'social' | 'local' | 'global', misskeyApiClient: api.APIClient) {
        this.notes = new Observable<Note[]>([]);
        this.misskeyApiClient = misskeyApiClient;
        if (misskeyApiClient.credential == null) {
            throw Error('misskeyApiClient for TimelineFeed must have credential');
        }
        this.stream = new Stream(misskeyApiClient.origin, { token: misskeyApiClient.credential })
    }

    initFeed() {
        console.log('initFeed');
        this.notes.value = [];
        this.initLoad = true;
        this.loadMore();
        this.setChannel();
    }

    addNote(note: Note) {
        if (this.notes.value.some(n => n.id === note.id)) {
            console.warn("duplicate note id");
            return;
        }

        const newNotes = [note, ...this.notes.value];
        this.notes.value = newNotes;
        this.stream.send('subNote', { id: note.id });
        if (this.notes.value.length > 50) {
            const oldNote = this.notes.value.pop();
            if (oldNote) {
                this.stream.send('unsubNote', { id: oldNote.id });
            }
        }
    }

    addNoteRev(note: Note) {
        if (this.notes.value.some(n => n.id === note.id)) {
            console.warn("duplicate note id");
            return;
        }

        const newNotes = [...this.notes.value, note];
        this.notes.value = newNotes;
        this.stream.send('subNote', { id: note.id });
        if (this.notes.value.length > 50) {
            const oldNote = this.notes.value.pop();
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
        const len = this.notes.value.length;
        const lastNoteId = this.notes.value[len - 1]?.id;
        const limit = 20;

        switch (this.timelineType) {
            case 'home':
                this.misskeyApiClient.request('notes/timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then(
                    this.initLoad ?
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNoteRev(note);
                            })
                        }
                        :
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNote(note);
                            })
                        }
                );
                break;
            case 'social':
                this.misskeyApiClient.request('notes/hybrid-timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then(
                    this.initLoad ?
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNoteRev(note);
                            })
                        }
                        :
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNote(note);
                            })
                        }
                );
                break;
            case 'local':
                this.misskeyApiClient.request('notes/local-timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then(
                    this.initLoad ?
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNoteRev(note);
                            })
                        }
                        :
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNote(note);
                            })
                        }
                );
                break;
            case 'global':
                this.misskeyApiClient.request('notes/global-timeline', {
                    limit,
                    untilId: lastNoteId,
                }).then(
                    this.initLoad ?
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNoteRev(note);
                            })
                        }
                        :
                        (notes) => {
                            notes.forEach((note) => {
                                this.addNote(note);
                            })
                        }
                );
                break;
        }


        if (this.initLoad) {
            this.doAutoUpdateFeed = true;
            this.initLoad = false;
        }
    }
}