import { Tabs } from "@mantine/core";
import React, { memo, useState } from "react";
import MisskeyTimeline, { TimelineType } from "@/components/MisskeyTimeline";


const MisskeyTimelineContainer = memo(function MisskeyTimelineContainer() {
    const [timelineType, setTimelineType] = useState<TimelineType>('home');

    return (
        <React.Fragment>
            <Tabs value={timelineType} onChange={(value) => setTimelineType(value as TimelineType)}>
                <Tabs.List>
                    <Tabs.Tab value="home">Home</Tabs.Tab>
                    <Tabs.Tab value="social">Social</Tabs.Tab>
                    <Tabs.Tab value="local">Local</Tabs.Tab>
                    <Tabs.Tab value="global">Global</Tabs.Tab>
                </Tabs.List>
            </Tabs>
            <MisskeyTimeline timelineType={timelineType} />
        </React.Fragment>
    )
});
export default MisskeyTimelineContainer;