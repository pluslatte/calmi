// src/components/MisskeyTimelineContainer.tsx
import { Box, Flex, Tabs, Tooltip } from "@mantine/core";
import React, { memo, useEffect, useRef } from "react";
import MisskeyTimeline from "@/components/timeline/MisskeyTimeline";
import TimelineNotifications from "@/components/timeline/TimelineNotifications";
import { IconGalaxy, IconHome, IconHomePlus, IconServer, IconBell } from "@tabler/icons-react";
import { useTimelineStore } from '@/stores/timeline/useTimelineStore';
import { useTimelineUiStore } from "@/stores/timeline/useTimelineUiStore";
import { TabType, TimelineType } from "@/types/misskey.types";

const MisskeyTimelineContainer = memo(function MisskeyTimelineContainer({
    containerRef
}: {
    containerRef: React.RefObject<HTMLDivElement | null>
}) {
    const changeTimelineType = useTimelineStore(state => state.changeTimelineType);
    const updateButtonOffset = useTimelineUiStore(state => state.updateButtonOffset);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // ローカルストレージからタイムラインタイプを読み込み
    let savedTimelineType: TimelineType | null = null;
    try {
        const saved = localStorage.getItem('calmi_timeline_type') as TimelineType | null;
        if (saved && ['home', 'social', 'local', 'global'].includes(saved)) {
            savedTimelineType = saved;
        }
    } catch (error) {
        console.error('Failed to load timeline type from localStorage:', error);
    }
    if (!savedTimelineType) {
        savedTimelineType = 'home'; // デフォルト値
    }

    // 現在選択されているタブ（タイムラインタイプまたは通知）
    const [activeTab, setActiveTab] = React.useState<TabType>(savedTimelineType);

    // コンポーネントのマウント時にボタン位置を更新
    useEffect(() => {
        updateButtonOffset(containerRef);
    }, [containerRef, updateButtonOffset]);

    // タブ変更ハンドラ
    const handleTabChange = (value: string | null) => {
        if (!value) return;

        // タイムラインタイプをローカルストレージに保存
        try {
            localStorage.setItem('calmi_timeline_type', value);
        } catch (error) {
            console.error('Failed to save timeline type to localStorage:', error);
        }

        setActiveTab(value as TabType);

        // 通知以外のタブが選択された場合は従来のタイムラインタイプとして扱う
        if (value !== 'notifications' && ['home', 'social', 'local', 'global'].includes(value)) {
            changeTimelineType();
        }
    };

    return (
        <Flex direction="column" h="100%" style={{ overflowX: 'hidden' }}>
            <Tabs
                value={activeTab}
                variant="default"
                onChange={handleTabChange}
            >
                <Tabs.List justify="center" px="md">
                    <Tooltip label="ホーム">
                        <Tabs.Tab value="home" leftSection={<IconHome size={18} />}></Tabs.Tab>
                    </Tooltip>
                    <Tooltip label="ソーシャル">
                        <Tabs.Tab value="social" leftSection={<IconHomePlus size={18} />}></Tabs.Tab>
                    </Tooltip>
                    <Tooltip label="ローカル">
                        <Tabs.Tab value="local" leftSection={<IconServer size={18} />}></Tabs.Tab>
                    </Tooltip>
                    <Tooltip label="グローバル">
                        <Tabs.Tab value="global" leftSection={<IconGalaxy size={18} />}></Tabs.Tab>
                    </Tooltip>
                    <Tooltip label="通知">
                        <Tabs.Tab value="notifications" leftSection={<IconBell size={18} />}></Tabs.Tab>
                    </Tooltip>
                </Tabs.List>
            </Tabs>
            <Box style={{ flex: 1, overflow: 'hidden', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                {activeTab !== 'notifications' ? (
                    <MisskeyTimeline
                        timelineType={activeTab}
                        scrollAreaRef={scrollAreaRef}
                        containerRef={containerRef}
                    />
                ) : (
                    <TimelineNotifications />
                )}
            </Box>
        </Flex>
    )
});

export default MisskeyTimelineContainer;