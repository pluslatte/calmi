import { Box, Flex, ScrollArea, Tabs, Tooltip } from "@mantine/core";
import React, { memo, useRef, useState } from "react";
import MisskeyTimeline, { TimelineType } from "@/components/MisskeyTimeline";
import { IconGalaxy, IconHome, IconHomePlus, IconServer } from "@tabler/icons-react";


const MisskeyTimelineContainer = memo(function MisskeyTimelineContainer() {
    const [timelineType, setTimelineType] = useState<TimelineType>('home');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    return (
        <Flex direction="column" h="100%">
            <Tabs
                value={timelineType}
                variant="default"
                onChange={(value) => setTimelineType(value as TimelineType)}
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
                    <MisskeyTimeline timelineType={timelineType} scrollAreaRef={scrollAreaRef} />
                </Box>
            </ScrollArea>
        </Flex>
    )
});
export default MisskeyTimelineContainer;