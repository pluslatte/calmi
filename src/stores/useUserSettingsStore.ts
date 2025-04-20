import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

interface UserSettingsState {
    // CW関連設定
    autoExpandCw: boolean;
}

interface UserSettingsActions {
    // CW自動展開設定の切り替え
    toggleAutoExpandCw: () => void;
}

// デフォルト値
const DEFAULT_AUTO_EXPAND_CW = false;

export const useUserSettingsStore = create<UserSettingsState & UserSettingsActions>()(
    persist(
        immer((set) => ({
            // 初期状態
            autoExpandCw: DEFAULT_AUTO_EXPAND_CW,

            // アクション
            toggleAutoExpandCw: () => {
                set((state) => {
                    state.autoExpandCw = !state.autoExpandCw;
                });
            },
        })),
        {
            name: 'calmi-user-settings', // ローカルストレージのキー名
        }
    )
);