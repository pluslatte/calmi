import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils'; // カスタムレンダー関数をインポート
import MisskeyNote from '@/components/MisskeyNote';
import { Note } from 'misskey-js/entities.js';
import { MantineProvider } from "@mantine/core";

// 改善したモック
vi.mock('mfm-js', () => ({
    parse: vi.fn((text) => {
        // ユーザー名の場合（パターンマッチング）
        if (text && text.includes('**テストユーザー**')) {
            return [{ type: 'bold', children: [{ type: 'text', props: { text: 'テストユーザー' } }] }];
        }
        // 通常のテキスト
        return [{ type: 'text', props: { text: text || '' } }];
    })
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
                avatarUrl: 'https://hogehoge.pluslatte.com/avatar.png',
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
            url: 'https://hogehoge.pluslatte.com',
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
        render(
            <MantineProvider>
                <MisskeyNote note={mockNote} />
            </MantineProvider>
        );

        // 検証 (Assert)
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
        expect(screen.getByText('これはテストノートです')).toBeInTheDocument();
        expect(screen.getByText('@testuser')).toBeInTheDocument();
    });
});