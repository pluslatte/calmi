import { Tabs, Tooltip } from "@mantine/core";
import { IconGalaxy, IconHome, IconHomePlus, IconServer } from "@tabler/icons-react";
import { TimelineType } from "@/lib/misskey/api/TimelineApi";

export function TimelineHeader({
    timelineType,
    onChangeType
}: {
    timelineType: TimelineType;
    onChangeType: (type: TimelineType) => void;
}) {
    return (
        <Tabs
            value={timelineType}
            variant="default"
            onChange={(value) => onChangeType(value as TimelineType)}
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
    );
}