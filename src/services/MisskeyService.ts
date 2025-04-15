import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";
import { TimelineStream } from "@/lib/misskey/stream/TimelineStream";
import { TimelineType } from "@/lib/misskey/api/TimelineApi";

export class MisskeyService {
    private apiClient: api.APIClient;

    constructor(credentials: { origin: string; token: string }) {
        this.apiClient = new api.APIClient({
            origin: credentials.origin,
            credential: credentials.token
        });
    }

    // APIクライアントを取得
    getApiClient() {
        return this.apiClient;
    }

    // ストリーム取得
    createTimelineStream() {
        return new TimelineStream(this.apiClient);
    }

    // タイムラインデータ取得
    async fetchTimeline(timelineType: TimelineType, options: { untilId?: string, limit?: number } = {}): Promise<Note[]> {
        const limit = options.limit || 20;
        const params = options.untilId
            ? { limit, untilId: options.untilId }
            : { limit };

        switch (timelineType) {
            case 'home':
                return this.apiClient.request('notes/timeline', params);
            case 'social':
                return this.apiClient.request('notes/hybrid-timeline', params);
            case 'local':
                return this.apiClient.request('notes/local-timeline', params);
            case 'global':
                return this.apiClient.request('notes/global-timeline', params);
        }
    }

    // ノート作成
    async createNote(text: string, visibility: 'public' | 'home' | 'followers' | 'specified' = 'public') {
        return this.apiClient.request('notes/create', {
            visibility,
            text,
        });
    }

    // リアクション追加
    async reactToNote(noteId: string, reaction: string) {
        return this.apiClient.request('notes/reactions/create', {
            noteId,
            reaction
        });
    }

    // 認証関連（静的メソッド）
    static async authenticateWithSession(sessionId: string, host: string): Promise<string> {
        const res = await fetch(`${host}/api/miauth/${sessionId}/check`, {
            method: 'POST',
        });

        if (!res.ok) {
            throw new Error('Authentication failed');
        }

        const data = await res.json();
        return data.token;
    }
}