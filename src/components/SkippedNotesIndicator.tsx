import { Paper, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { bg, ja } from "date-fns/locale";

interface SkippedNotesIndicatorProps {
    count: number;
    timestamp: Date;
}

export default function SkippedNotesIndicator({
    count,
    timestamp
}: SkippedNotesIndicatorProps) {
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true, locale: ja });

    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();

    // テーマに基づいてスタイルを調整
    const isDark = colorScheme === 'dark';

    // 背景色: ダークモードでは少し暗め、ライトモードでは少し明るめ
    const bgColor = isDark ? theme.colors.dark[6] : theme.colors.gray[0];

    // テキスト色: ダークモードでは少し明るめ、ライトモードでは少し暗め
    const textColor = isDark ? theme.colors.dark[0] : theme.colors.gray[6];

    // アクセント色: テーマプライマリーカラーの薄いバージョン
    const accentColor = isDark ? theme.colors.cyan[8] : theme.colors.cyan[4];

    // 強調テキスト色: テーマプライマリーカラー
    const highlightColor = isDark ? theme.colors.cyan[4] : theme.colors.cyan[6];

    return (
        <Paper
            withBorder
            p="xs"
            my="md"
            bg={bgColor}
            style={{
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: '4px',
                borderTop: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                borderRight: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
                opacity: 0.7, // 少し透明に
            }}
        >
            <Text size="sm" ta="center" c={textColor}>
                <Text span fw="bold" c={highlightColor}>{count}件</Text>
                のノートがスキップされました {timeAgo}
            </Text>
        </Paper>
    );
}