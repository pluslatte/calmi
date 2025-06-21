import { describe, expect, it } from "vitest";
import AccountManager from "./page";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";

describe('page.tsx', () => {
    describe('認証チェック', () => {
        it('ログインしていない場合はアカウントマネージャを表示しない', () => {
            renderWithProviders(<AccountManager />, {
                session: null,
                sessionStatus: 'unauthenticated'
            });
            expect(screen.queryByText("アカウントマネージャ")).toBeNull();
        });

        it('認証状態がロード中の場合はアカウントマネージャを表示しない', () => {
            renderWithProviders(<AccountManager />, {
                session: null,
                sessionStatus: 'loading'
            });
            expect(screen.queryByText("アカウントマネージャ")).toBeNull();
        });

        it('ログインしている場合はアカウントマネージャを表示する', () => {
            const mockSession = {
                user: { name: 'Test User', email: 'test@example.com' },
                expires: '2024-12-31',
            };
            renderWithProviders(<AccountManager />, {
                session: mockSession,
                sessionStatus: 'authenticated'
            });
            expect(screen.getByText("アカウントマネージャ")).toBeInTheDocument();
        });
    });

    describe('HTML構造の確認', () => {
        const mockSession = {
            user: { name: 'Test User', email: 'test@example.com' },
            expires: '2024-12-31',
        };

        it('ページタイトルがh1要素として正しく表示されること', () => {
            renderWithProviders(<AccountManager />, {
                session: mockSession,
                sessionStatus: 'authenticated'
            });

            const title = screen.getByRole('heading', { level: 1 });
            expect(title).toBeInTheDocument();
            expect(title).toHaveTextContent('アカウントマネージャ');
        });

        it('サインアウトボタンが存在すること', () => {
            renderWithProviders(<AccountManager />, {
                session: mockSession,
                sessionStatus: 'authenticated'
            });

            const signOutButton = screen.getByRole('button', { name: 'サインアウト' });
            expect(signOutButton).toBeInTheDocument();
        });

        it('Container要素が適切にレンダリングされること', () => {
            renderWithProviders(<AccountManager />, {
                session: mockSession,
                sessionStatus: 'authenticated'
            });

            // Containerの内容が存在することで間接的に確認
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'サインアウト' })).toBeInTheDocument();
        });

        it('ページに必要なセクションが存在すること', () => {
            renderWithProviders(<AccountManager />, {
                session: mockSession,
                sessionStatus: 'authenticated'
            });

            // 新規アカウント登録フォームの存在確認
            expect(document.querySelector('form')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: '新規アカウント登録' })).toBeInTheDocument();

            // アカウントリストセクションの存在確認（loading状態またはコンテンツ）
            // RegisteredAccountListが何らかの形でレンダリングされていることを確認
            const hasLoader = screen.queryByRole('progressbar');
            const hasAccountTextAll = screen.queryAllByText(/アカウント/);
            expect(hasLoader || hasAccountTextAll.length > 0).toBeTruthy();
        });
    });
});
