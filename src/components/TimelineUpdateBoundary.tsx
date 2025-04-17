import { Box, Divider, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface TimelineUpdateBoundaryProps {
    timestamp: Date;
}

export default function TimelineUpdateBoundary({ timestamp }: TimelineUpdateBoundaryProps) {
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const isDark = colorScheme === 'dark';
    const formattedTime = format(timestamp, 'HH:mm', { locale: ja });
    const textColor = isDark ? theme.colors.dark[0] : theme.colors.gray[6];
    const accentColor = isDark ? theme.colors.blue[5] : theme.colors.blue[4];

    return (
        <Box my="md">
            <Divider
                my="xs"
                label={
                    <Text size="xs" c={textColor}>
                        <Text span fw="bold" c={accentColor}>{formattedTime}</Text>
                        からの新着ノート
                    </Text>
                }
                labelPosition="center"
                color={accentColor}
                opacity={0.7}
            />
        </Box>
    );
}