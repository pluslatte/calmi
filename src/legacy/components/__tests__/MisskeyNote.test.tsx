import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MisskeyNote from '@/components/MisskeyNote';
import { createMockNote } from '@/test/helpers'; // テストヘルパーを活用
import { MantineProvider } from "@mantine/core";

// モックの設定
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
        // テストヘルパーを使用してモックデータを作成
        const mockNote = createMockNote({
            text: 'これはテストノートです'
        });

        render(
            <MantineProvider>
                <MisskeyNote note={mockNote} />
            </MantineProvider>
        );

        // 検証
        expect(screen.getByText('テストユーザー')).toBeInTheDocument();
        expect(screen.getByText('これはテストノートです')).toBeInTheDocument();
        expect(screen.getByText('@testuser')).toBeInTheDocument();
    });
});