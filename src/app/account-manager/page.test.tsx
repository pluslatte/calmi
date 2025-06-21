import { describe, expect, it } from "vitest";
import AccountManager from "./page";
import { renderWithProviders, screen } from "@/tests/utils/test-utils";
import { setMockSession } from "@/tests/mocks/next-auth";

describe('page.tsx', () => {
    describe('認証チェック', () => {
        it('ログインしていない場合はアカウントマネージャを表示しない', () => {
            setMockSession({
                data: null,
                status: 'unauthenticated',
            });
            renderWithProviders(<AccountManager />);
            expect(screen.queryByText("アカウントマネージャ")).toBeNull();
        });

        it('ログインしている場合はアカウントマネージャを表示する', () => {
            setMockSession({
                data: null,
                status: 'authenticated',
            });
            renderWithProviders(<AccountManager />);
            expect(screen.getByText("アカウントマネージャ"));
        });
    });
});