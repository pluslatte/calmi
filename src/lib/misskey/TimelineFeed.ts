'use client';

import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { Observable } from "../Observable";
import { MisskeyStream } from "./MisskeyStream";

export class TimelineFeed {
    notes: Observable<Note[]>;
    misskeyApiClient: api.APIClient;
    private misskeyStream: MisskeyStream;

    doAutoUpdateFeed = false;
    initLoad = false;
    newNotesBuffer: Note[] = [];
    bufferEnabled = false;

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
        if (this.bufferEnabled) {
            console.log('bufferEnabled ' + note.id);
            this.newNotesBuffer.unshift(note);
        } else if (this.doAutoUpdateFeed) {
            console.log('bufferDisabled ' + note.id);
            this.addNote(note);
        }
    }

    initFeed() {
        console.log('initFeed');
        this.notes.value = [];
        this.initLoad = true;
        this.misskeyStream.connect();
    }

    reloadLatest() {
        this.notes.value = [];
        this.doAutoUpdateFeed = false;
        this.initLoad = true;
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
            }
        }
    }

    loadMore() {
        const len = this.notes.value.length;
        const lastNoteId = this.notes.value[len - 1]?.id;
        const limit = 20;

        console.log(`loadmore! len: ${len} lastNoteId: ${lastNoteId}`);

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
                                this.addNoteRev(note);
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
                                this.addNoteRev(note);
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
                                this.addNoteRev(note);
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
                                this.addNoteRev(note);
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

    flushBufferedNotes() {
        if (this.newNotesBuffer.length > 0) {
            // Unsubscribe old notes.
            this.notes.value.forEach(n => {
                console.log("unsubscribe note: " + n.id);
                this.misskeyStream.unsubscribeFromNote(n.id);
            });

            // Replace this.notes.value with the buffer.
            this.notes.value = [...this.newNotesBuffer];
            this.newNotesBuffer.forEach(n => this.misskeyStream.subscribeToNote(n.id));

            if (this.newNotesBuffer.length < 10) {
                // If it was not enough to fill the feed, load more.
                // TODO: 上へ戻る が押されたとき、一瞬ノートが消えて loadmore が誘発されてダブっているのを直す（対策してあるので影響はないが、汚い）
                this.loadMore();
            }

            this.newNotesBuffer = [];
        }
    }

    enableBuffering() {
        this.bufferEnabled = true;
    }

    disableBufferingAndFlush() {
        this.bufferEnabled = false;
        this.flushBufferedNotes();
    }

    // Clean up resources when timeline is no longer needed
    cleanup() {
        this.misskeyStream.disconnect();
    }
}