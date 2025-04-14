import { Box, Flex, ScrollArea, Tabs, Tooltip } from "@mantine/core";
import React, { memo, useState } from "react";
import MisskeyTimeline, { TimelineType } from "@/components/MisskeyTimeline";
import { IconGalaxy, IconHome, IconHomePlus, IconServer } from "@tabler/icons-react";


const MisskeyTimelineContainer = memo(function MisskeyTimelineContainer() {
    const [timelineType, setTimelineType] = useState<TimelineType>('home');

    return (
        <Flex direction="column" h="100%">
            <Tabs
                value={timelineType}
                variant="default"
                onChange={(value) => setTimelineType(value as TimelineType)}
            >
                <Tabs.List justify="center" px="md" pt="xs">
                    <Tooltip label="Home">
                        <Tabs.Tab value="home" leftSection={<IconHome size={18} />}></Tabs.Tab>
                    </Tooltip>
                    <Tooltip label="Social">
                        <Tabs.Tab value="social" leftSection={<IconHomePlus size={18} />}></Tabs.Tab>
                    </Tooltip>
                    <Tooltip label="Local">
                        <Tabs.Tab value="local" leftSection={<IconServer size={18} />}></Tabs.Tab>
                    </Tooltip>
                    <Tooltip label="Global">
                        <Tabs.Tab value="global" leftSection={<IconGalaxy size={18} />}></Tabs.Tab>
                    </Tooltip>
                </Tabs.List>
            </Tabs>
            <ScrollArea flex={1} type="auto">
                <Box mr="sm">
                    <MisskeyTimeline timelineType={timelineType} />
                </Box>
            </ScrollArea>
        </Flex>
    )
});
export default MisskeyTimelineContainer;