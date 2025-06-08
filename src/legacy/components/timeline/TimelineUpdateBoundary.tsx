import { Box, Divider, Text, useMantineTheme } from "@mantine/core";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface TimelineUpdateBoundaryProps {
    timestamp: Date;
}

export default function TimelineUpdateBoundary({ timestamp }: TimelineUpdateBoundaryProps) {
    const theme = useMantineTheme();
    const formattedTime = format(timestamp, 'HH:mm', { locale: ja });
    const textColor = theme.colors.dark[0];
    const accentColor = theme.colors.cyan[5];
    return (
        <Box my="md">
            <Divider
                my="xs"
                label={
                    <Text size="xs" c={textColor}>
                        これより
                        <Text span fw="bold" c={accentColor}>{formattedTime}</Text>
                        からの新着ノートを表示します...
                    </Text>
                }
                labelPosition="center"
                color={accentColor}
                opacity={0.7}
            />
        </Box>
    );
}