import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MisskeyNote from '../MisskeyNote';
import { Note } from 'misskey-js/entities.js';
import '@testing-library/jest-dom';

// モックの作成
vi.mock('mfm-js', () => ({
    parse: vi.fn(() => [{ type: 'text', props: { text: 'これはテストノートです' } }])
}));

describe('MisskeyNote', () => {
    // テストケース1: 基本的なノートの表示
    it('テキストと作成者の情報を表示する', () => {
        // 準備 (Arrange)
        // 必要なプロパティをすべて含む正確なモックデータを作成
        const mockNote: Note = {
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
            reactionCount: 0
        };

        // 実行 (Act)
        render(<MisskeyNote note={mockNote} />);

        // 検証 (Assert)
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
        expect(screen.getByText('これはテストノートです')).toBeInTheDocument();
        expect(screen.getByText('@testuser')).toBeInTheDocument();
    });
});