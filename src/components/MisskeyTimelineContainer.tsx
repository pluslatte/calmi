// src/components/MisskeyTimelineContainer.tsx（Zustandを使用するように修正）
import { Box, Flex, ScrollArea, Tabs, Tooltip } from "@mantine/core";
import React, { memo, useRef } from "react";
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

    const scrollAreaRef = useRef<HTMLDivElement>(null);

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
                <Tabs.List justify="center" px="md" pt="xs">
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