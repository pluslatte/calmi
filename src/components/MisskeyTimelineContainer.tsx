import { Box, Flex, ScrollArea, Tabs, Tooltip } from "@mantine/core";
import React, { memo, useRef, useState } from "react";
import MisskeyTimeline, { TimelineType } from "@/components/MisskeyTimeline";
import { IconGalaxy, IconHome, IconHomePlus, IconServer } from "@tabler/icons-react";
import { TimelineHeader } from "./timeline/TimelineHeader";


const MisskeyTimelineContainer = memo(function MisskeyTimelineContainer({
    containerRef
}: {
    containerRef: React.RefObject<HTMLDivElement | null>
}) {
    const [timelineType, setTimelineType] = useState<TimelineType>('home');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    return (
        <Flex direction="column" h="100%">
            <TimelineHeader
                timelineType={timelineType}
                onChangeType={(type) => setTimelineType(type)}
            />
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