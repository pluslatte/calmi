// src/components/MisskeyTimelineContainer.tsx
import { Box, Flex, ScrollArea, Tabs, Tooltip } from "@mantine/core";
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
    // Zustandストアからタイムラインタイプと変更アクションを取得
    const timelineType = useTimelineStore(state => state.timelineType);
    const changeTimelineType = useTimelineStore(state => state.changeTimelineType);
    const updateButtonOffset = useTimelineUiStore(state => state.updateButtonOffset);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // 現在選択されているタブ（タイムラインタイプまたは通知）
    const [activeTab, setActiveTab] = React.useState<TabType>(timelineType);

    // タイムラインタイプが変更されたらactiveTabも更新
    useEffect(() => {
        setActiveTab(timelineType);
    }, [timelineType]);

    // コンポーネントのマウント時にボタン位置を更新
    useEffect(() => {
        updateButtonOffset(containerRef);
    }, [containerRef, updateButtonOffset]);

    // タブ変更ハンドラ
    const handleTabChange = (value: string | null) => {
        if (!value) return;

        setActiveTab(value as TabType);

        // 通知以外のタブが選択された場合は従来のタイムラインタイプとして扱う
        if (value !== 'notifications' && ['home', 'social', 'local', 'global'].includes(value)) {
            changeTimelineType(value as TimelineType);
            // ストア内のchangeTimelineTypeがローカルストレージへの保存を担当
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
            <ScrollArea viewportRef={scrollAreaRef} flex={1} type="scroll">
                <Box maw="calc(100vw - 8px)">
                    {activeTab !== 'notifications' ? (
                        <MisskeyTimeline
                            timelineType={timelineType}
                            scrollAreaRef={scrollAreaRef}
                            containerRef={containerRef}
                        />
                    ) : (
                        <TimelineNotifications />
                    )}
                </Box>
            </ScrollArea>
        </Flex>
    )
});

export default MisskeyTimelineContainer;