import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface TimelineUiState {
    // 上へ戻るボタン関連の状態
    showScrollToTop: boolean;
    buttonRightOffset: number | null;
}

interface TimelineUiActions {
    // 上へ戻るボタン関連のアクション
    initializeTimelineUi: () => void;
    scrollToTop: (scrollAreaRef: React.RefObject<HTMLDivElement | null>) => void;
    updateButtonOffset: (containerRef: React.RefObject<HTMLDivElement | null>) => void;
}

export const useTimelineUiStore = create<TimelineUiState & TimelineUiActions>()(
    immer((set) => ({
        // 状態と初期値
        showScrollToTop: false,
        buttonRightOffset: null,

        // アクション
        initializeTimelineUi: () => {
            set(state => {
                state.showScrollToTop = false;
            });
        },

        // スクロール位置をトップに戻す
        scrollToTop: (scrollAreaRef) => {
            if (!scrollAreaRef.current) return;
            scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        },

        // ボタンの位置調整
        updateButtonOffset: (containerRef) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const offset = window.innerWidth - rect.right;

            set(state => {
                state.buttonRightOffset = offset + 16;
            });
        },
    }))
)