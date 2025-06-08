import { Note } from 'misskey-js/entities.js';

/**
 * テスト用のモックノートを作成するヘルパー関数
 */
export function createMockNote(overrides: Partial<Note> = {}): Note {
    return {
        id: 'test-id',
        createdAt: new Date().toISOString(),
        userId: 'user-id',
        user: {
            id: 'user-id',
            username: 'testuser',
            name: 'テストユーザー',
            host: null,
            avatarUrl: 'https://example.com/avatar.png',
            avatarBlurhash: null,
            isBot: false,
            isCat: false,
            emojis: {},
            onlineStatus: 'online',
            avatarDecorations: []
        },
        text: 'これはテストノートです',
        cw: null,
        visibility: 'public',
        localOnly: false,
        reactionAcceptance: null,
        reactions: {},
        renoteCount: 0,
        repliesCount: 0,
        uri: 'https://hogehoge.pluslatte.com',
        url: 'https://hogehoge.pluslatet.com',
        fileIds: [],
        files: [],
        replyId: null,
        renoteId: null,
        mentions: [],
        emojis: {},
        tags: [],
        channelId: null,
        reactionEmojis: {},
        reactionCount: 0,
        ...overrides
    };
}