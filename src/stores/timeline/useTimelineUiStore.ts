import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface TimelineUiState {
    // タイムラインUI関連の状態
}

interface TimelineUiActions {
    // タイムラインUI関連のアクション
    initializeTimelineUi: () => void;
}

export const useTimelineUiStore = create<TimelineUiState & TimelineUiActions>()(
    immer((set) => ({
        // アクション
        initializeTimelineUi: () => {
            // 初期化処理
        },
    }))
)