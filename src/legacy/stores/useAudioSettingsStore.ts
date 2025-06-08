import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

interface AudioSettingsState {
    volume: number;
    muted: boolean;
}

interface AudioSettingsActions {
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    toggleMute: () => void;
}

// デフォルト値
const DEFAULT_VOLUME = 0.3; // 30%

export const useAudioSettingsStore = create<AudioSettingsState & AudioSettingsActions>()(
    persist(
        immer((set) => ({
            // 初期状態
            volume: DEFAULT_VOLUME,
            muted: false,

            // アクション
            setVolume: (volume: number) => {
                set((state) => {
                    state.volume = volume;
                    // 音量が0より大きくなり、かつミュート状態だった場合、ミュートを解除
                    if (volume > 0 && state.muted) {
                        state.muted = false;
                    }
                    // 音量が0になった場合、自動的にミュート状態にする
                    if (volume === 0 && !state.muted) {
                        state.muted = true;
                    }
                });
            },

            setMuted: (muted: boolean) => {
                set((state) => {
                    state.muted = muted;
                });
            },

            toggleMute: () => {
                set((state) => {
                    state.muted = !state.muted;
                });
            },
        })),
        {
            name: 'calmi-audio-settings', // ローカルストレージのキー名
        }
    )
);