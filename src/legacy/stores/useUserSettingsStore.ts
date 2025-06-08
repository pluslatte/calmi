import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

// 公開範囲の型定義
export type NoteVisibility = 'public' | 'home' | 'followers' | 'specified';

interface UserSettingsState {
    // CW関連設定
    autoExpandCw: boolean;
    // ノートの公開範囲設定
    defaultNoteVisibility: NoteVisibility;
}

interface UserSettingsActions {
    // CW自動展開設定の切り替え
    toggleAutoExpandCw: () => void;
    // ノートの公開範囲設定を変更
    setDefaultNoteVisibility: (visibility: NoteVisibility) => void;
}

// デフォルト値
const DEFAULT_AUTO_EXPAND_CW = false;
const DEFAULT_NOTE_VISIBILITY: NoteVisibility = 'home';

export const useUserSettingsStore = create<UserSettingsState & UserSettingsActions>()(
    persist(
        immer((set) => ({
            // 初期状態
            autoExpandCw: DEFAULT_AUTO_EXPAND_CW,
            defaultNoteVisibility: DEFAULT_NOTE_VISIBILITY,

            // アクション
            toggleAutoExpandCw: () => {
                set((state) => {
                    state.autoExpandCw = !state.autoExpandCw;
                });
            },
            
            // 公開範囲設定の変更
            setDefaultNoteVisibility: (visibility: NoteVisibility) => {
                set((state) => {
                    state.defaultNoteVisibility = visibility;
                });
            },
        })),
        {
            name: 'calmi-user-settings', // ローカルストレージのキー名
        }
    )
);