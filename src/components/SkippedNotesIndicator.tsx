import { Paper, Text } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface SkippedNotesIndicatorProps {
    count: number;
    timestamp: Date;
}

export default function SkippedNotesIndicator({
    count,
    timestamp
}: SkippedNotesIndicatorProps) {
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true, locale: ja });

    return (
        <Paper
            withBorder
            p="xs"
            my="md"
            bg="blue.1"
            style={{
                borderLeft: '4px solid var(--mantine-color-blue-6)',
                borderRadius: '4px'
            }}
        >
            <Text size="sm" ta="center" c="dimmed">
                <Text span fw="bold" c="blue.7">{count}件</Text>
                のノートがスキップされました {timeAgo}
            </Text>
        </Paper>
    );
}