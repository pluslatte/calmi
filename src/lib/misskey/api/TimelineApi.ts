import { api } from "misskey-js";
import { Note } from "misskey-js/entities.js";

// タイムラインタイプの型定義
export type TimelineType = 'home' | 'social' | 'local' | 'global';

export class TimelineApi {
    constructor(private apiClient: api.APIClient) {
        if (!apiClient.credential) {
            throw Error('API client must have credential');
        }
    }

    // タイムラインデータを取得する関数
    async fetchTimeline(
        timelineType: TimelineType,
        options: { untilId?: string, limit?: number } = {}
    ): Promise<Note[]> {
        const endpoint = this.getEndpointForType(timelineType);
        const limit = options.limit || 20;

        // APIエンドポイントごとに適切なパラメータで呼び出し
        switch (timelineType) {
            case 'home':
                return this.apiClient.request('notes/timeline', {
                    limit,
                    ...(options.untilId ? { untilId: options.untilId } : {})
                });
            case 'social':
                return this.apiClient.request('notes/hybrid-timeline', {
                    limit,
                    ...(options.untilId ? { untilId: options.untilId } : {})
                });
            case 'local':
                return this.apiClient.request('notes/local-timeline', {
                    limit,
                    ...(options.untilId ? { untilId: options.untilId } : {})
                });
            case 'global':
                return this.apiClient.request('notes/global-timeline', {
                    limit,
                    ...(options.untilId ? { untilId: options.untilId } : {})
                });
            default:
                throw new Error(`Unknown timeline type: ${timelineType}`);
        }
    }

    // タイムラインタイプに応じたAPIエンドポイントを返す関数（内部的に使用）
    private getEndpointForType(timelineType: TimelineType): string {
        switch (timelineType) {
            case 'home': return 'notes/timeline';
            case 'social': return 'notes/hybrid-timeline';
            case 'local': return 'notes/local-timeline';
            case 'global': return 'notes/global-timeline';
            default:
                throw new Error(`Unknown timeline type: ${timelineType}`);
        }
    }
}