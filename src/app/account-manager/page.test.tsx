import { describe, expect, it } from "vitest";
import AccountManager from "./page";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";

describe('page.tsx', () => {
    describe('認証チェック', () => {
        it('ログインしていない場合はアカウントマネージャを表示しない', () => {
            renderWithProviders(<AccountManager />, { session: null });
            expect(screen.queryByText("アカウントマネージャ")).toBeNull();
        });

        it('ログインしている場合はアカウントマネージャを表示する', () => {
            const mockSession = {
                user: { name: 'Test User', email: 'test@example.com' },
                expires: '2024-12-31',
            };
            renderWithProviders(<AccountManager />, { session: mockSession });
            expect(screen.getByText("アカウントマネージャ"));
        });
    });
});