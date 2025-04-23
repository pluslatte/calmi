import { Box, Collapse, Divider, Loader, Paper, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Note } from "misskey-js/entities.js";
import { useState } from "react";
import MisskeyNote from "./MisskeyNote";
import MisskeyNoteActions from "./MisskeyNoteActions";

interface TrimmedNotesIndicatorProps {
    count: number;
    timestamp: Date;
    loadTrimmedNotes: () => Promise<Note[] | null>;
    loadedNotes: Note[] | null;
    isLoading: boolean;
}

export default function TrimmedNotesIndicator({
    count,
    timestamp,
    loadTrimmedNotes,
    loadedNotes,
    isLoading
}: TrimmedNotesIndicatorProps) {
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true, locale: ja });
    const theme = useMantineTheme();
    const [expanded, setExpanded] = useState(false);

    // テーマに基づいてスタイルを調整
    const bgColor = theme.colors.dark[6];
    const textColor = theme.colors.dark[0];
    const accentColor = theme.colors.yellow[8];
    const highlightColor = theme.colors.yellow[4];

    // クリック時処理
    const handleClick = async () => {
        // すでに読み込まれているか展開されている場合は折りたたみ切り替えのみ
        if (loadedNotes || expanded) {
            setExpanded(!expanded);
            return;
        }

        // まだ読み込まれていない場合は読み込みを開始
        if (!isLoading) {
            const notes = await loadTrimmedNotes();
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
                borderTop: `1px solid ${theme.colors.dark[4]}`,
                borderRight: `1px solid ${theme.colors.dark[4]}`,
                borderBottom: `1px solid ${theme.colors.dark[4]}`,
                opacity: 0.7,
            }}
        >
            <Box
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: isLoading ? 'default' : 'pointer',
                }}
                onClick={isLoading ? undefined : handleClick}
            >
                <Text size="sm" ta="center" c={textColor}>
                    <Text span fw="bold" c={highlightColor}>{count}件</Text>
                    {"の表示範囲から外れたノートがあります "}
                    <Text span c="dimmed">{timeAgo}</Text>
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
                                    <MisskeyNoteActions note={note} />
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
                            {isLoading ? 'ノートを読み込み中...' : '表示範囲外のノートを読み込めませんでした'}
                        </Text>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}