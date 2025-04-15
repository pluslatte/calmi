import { api, Stream } from "misskey-js";
import { Connection } from "misskey-js/streaming.js";
import { TimelineType } from "../api/TimelineApi";
import { Note } from "misskey-js/entities.js";

type Channels = {
    homeTimeline: any;
    hybridTimeline: any;
    localTimeline: any;
    globalTimeline: any;
};

export class TimelineStream {
    // タイムラインタイプとストリームチャンネルのマッピング
    private static readonly TIMELINE_CHANNELS: Record<TimelineType, keyof Channels> = {
        'home': 'homeTimeline',
        'social': 'hybridTimeline',
        'local': 'localTimeline',
        'global': 'globalTimeline'
    };

    stream: Stream;
    connection: Connection<any> | null = null;

    constructor(private apiClient: api.APIClient) {
        if (!apiClient.credential) {
            throw Error('API client must have credential');
        }
        this.stream = new Stream(apiClient.origin, { token: apiClient.credential });
    }

    // タイムラインストリームへ接続する
    connect(timelineType: TimelineType, onNoteReceived: (note: Note) => void) {
        const channelName = TimelineStream.TIMELINE_CHANNELS[timelineType];
        const channel = this.stream.useChannel(channelName);
        channel.on('note', onNoteReceived);
        this.connection = channel;

        return this.connection;
    }

    subscribeToNote(noteId: string) {
        this.stream.send('subNote', { id: noteId });
    }

    unsubscribeFromNote(noteId: string) {
        this.stream.send('unsubNote', { id: noteId });
    }

    disconnect() {
        if (this.stream) {
            this.stream.close();
        }
    }
}