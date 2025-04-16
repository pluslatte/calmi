import { Box, Collapse, Divider, Loader, Paper, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { bg, ja } from "date-fns/locale";
import { Note } from "misskey-js/entities.js";
import { useState } from "react";
import MisskeyNote from "./MisskeyNote";
import MisskeyNoteActions from "./MisskeyNoteActions";

interface SkippedNotesIndicatorProps {
    count: number;
    timestamp: Date;
    groupIndex: number;
    loadSkippedNotes: (groupIndex: number) => Promise<Note[] | null>;
    loadedNotes: Note[] | null;
    isLoading: boolean
}

export default function SkippedNotesIndicator({
    count,
    timestamp,
    groupIndex,
    loadSkippedNotes,
    loadedNotes,
    isLoading
}: SkippedNotesIndicatorProps) {
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true, locale: ja });
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const [expanded, setExpanded] = useState(false);

    // テーマに基づいてスタイルを調整
    const isDark = colorScheme === 'dark';
    const bgColor = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
    const textColor = isDark ? theme.colors.dark[0] : theme.colors.gray[6];
    const accentColor = isDark ? theme.colors.cyan[8] : theme.colors.cyan[4];
    const highlightColor = isDark ? theme.colors.cyan[4] : theme.colors.cyan[6];

    // クリック時処理
    const handleClick = async () => {
        // すでに読み込まれているか展開されている場合は折りたたみ切り替えのみ
        if (loadedNotes || expanded) {
            setExpanded(!expanded);
            return;
        }

        // まだ読み込まれていない場合は読み込みを開始
        if (!isLoading) {
            const notes = await loadSkippedNotes(groupIndex);
            if (notes && notes.length > 0) {
                setExpanded(true);
            }
        }
    };

    // 表示するノートの最大数
    const maxNotesToShow = 10;
    const hasMoreNotes = loadedNotes && loadedNotes.length < count;
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
                cursor: isLoading ? 'default' : 'pointer',
            }}
            onClick={isLoading ? undefined : handleClick}
        >
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size="sm" ta="center" c={textColor}>
                    <Text span fw="bold" c={highlightColor}>{count}件</Text>
                    のノートがスキップされました {timeAgo}
                </Text>
                {isLoading ? (
                    <Loader size="xs" />
                ) : (
                    expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
                )}
            </Box>

            <Collapse in={expanded}>
                <Box mt="sm">
                    {loadedNotes && loadedNotes.length > 0 ? (
                        <>
                            {loadedNotes.slice(0, maxNotesToShow).map(note => (
                                <Box key={note.id} mt="md">
                                    <MisskeyNote note={note} />
                                    <MisskeyNoteActions />
                                    <Divider my="sm" />
                                </Box>
                            ))}
                            {hasMoreNotes && (
                                <Text size="sm" c="dimmed" ta="center" my="xs">
                                    {count}件中{Math.min(maxNotesToShow, loadedNotes.length)}件のノートを表示しています
                                </Text>
                            )}
                        </>
                    ) : (
                        <Text size="sm" c="dimmed" ta="center">
                            {isLoading ? 'ノートを読み込み中...' : 'スキップされたノートを読み込めませんでした'}
                        </Text>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}