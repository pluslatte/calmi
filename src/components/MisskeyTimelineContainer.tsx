// src/components/MisskeyTimelineContainer.tsx
import { Box, Flex, ScrollArea, Tabs, Tooltip } from "@mantine/core";
import React, { memo, useEffect, useRef } from "react";
import MisskeyTimeline from "@/components/MisskeyTimeline";
import { IconGalaxy, IconHome, IconHomePlus, IconServer } from "@tabler/icons-react";
import { useTimelineStore, TimelineType } from '@/stores/useTimelineStore';

const MisskeyTimelineContainer = memo(function MisskeyTimelineContainer({
    containerRef
}: {
    containerRef: React.RefObject<HTMLDivElement | null>
}) {
    // Zustandストアからタイムラインタイプと変更アクションを取得
    const timelineType = useTimelineStore(state => state.timelineType);
    const changeTimelineType = useTimelineStore(state => state.changeTimelineType);
    const updateButtonOffset = useTimelineStore(state => state.updateButtonOffset);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // コンポーネントのマウント時にボタン位置を更新
    useEffect(() => {
        updateButtonOffset(containerRef);
    }, [containerRef, updateButtonOffset]);

    // タイムラインタイプの変更ハンドラ
    const handleTimelineTypeChange = (value: string | null) => {
        if (value && ['home', 'social', 'local', 'global'].includes(value)) {
            changeTimelineType(value as TimelineType);
        }
    };

    return (
        <Flex direction="column" h="100%">
            <Tabs
                value={timelineType}
                variant="default"
                onChange={handleTimelineTypeChange}
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
                </Tabs.List>
            </Tabs>
            <ScrollArea viewportRef={scrollAreaRef} flex={1} type="auto">
                <Box mr="sm">
                    <MisskeyTimeline
                        timelineType={timelineType}
                        scrollAreaRef={scrollAreaRef}
                        containerRef={containerRef}
                    />
                </Box>
            </ScrollArea>
        </Flex>
    )
});

export default MisskeyTimelineContainer;