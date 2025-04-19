// src/components/MisskeyNoteActions.tsx の修正
import { Group, ActionIcon, useMantineTheme, Box, Menu, Popover, Paper, Text, Avatar, Flex, rgba } from "@mantine/core";
import { IconArrowBackUp, IconRepeat, IconHeart, IconDots, IconMoodSmile } from "@tabler/icons-react";
import { useState } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Note } from "misskey-js/entities.js";

interface MisskeyNoteActionsProps {
    note: Note;
}

export default function MisskeyNoteActions({ note }: MisskeyNoteActionsProps) {
    const theme = useMantineTheme();
    const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
    const { createReaction, deleteReaction, apiState } = useMisskeyApiStore();

    // よく使われるリアクション絵文字のリスト
    const popularEmojis = ["👍", "❤️", "😆", "🎉", "🤔", "👏", "🙏", "🥺", "😮", "🫡"];

    // リアクション追加
    const handleAddReaction = async (emoji: string) => {
        try {
            await createReaction(note.id, emoji);
            setReactionPickerOpen(false);
        } catch (error) {
            console.error("リアクション追加エラー:", error);
        }
    };

    // リアクション削除
    const handleRemoveReaction = async (emoji: string) => {
        try {
            await deleteReaction(note.id, emoji);
        } catch (error) {
            console.error("リアクション削除エラー:", error);
        }
    };

    // リアクション表示部分
    const renderReactions = () => {
        if (!note.reactions || Object.keys(note.reactions).length === 0) {
            return null;
        }

        return (
            <Flex wrap="wrap" gap="xs" mt={8}>
                {Object.entries(note.reactions).map(([reaction, count]) => (
                    <Paper
                        key={reaction}
                        px="xs"
                        py="3px"
                        radius="xl"
                        withBorder
                        style={{
                            cursor: "pointer",
                            opacity: note.myReaction === reaction ? 1 : 0.8,
                            backgroundColor: note.myReaction === reaction
                                ? rgba(theme.colors.cyan[8], 0.1)
                                : undefined,
                            borderColor: note.myReaction === reaction
                                ? theme.colors.cyan[5]
                                : undefined,
                        }}
                        onClick={() => {
                            if (note.myReaction === reaction) {
                                handleRemoveReaction(reaction);
                            } else {
                                handleAddReaction(reaction);
                            }
                        }}
                    >
                        <Group gap={6} wrap="nowrap">
                            <Text span>{reaction}</Text>
                            <Text span size="xs" c="dimmed">{count}</Text>
                        </Group>
                    </Paper>
                ))}
            </Flex>
        );
    };

    return (
        <Box>
            <Group gap="xl" mt={4} mb={4}>
                <Box w="md" />

                <ActionIcon
                    variant="subtle"
                    aria-label="reply"
                    c={theme.colors.dark[0]}
                >
                    <IconArrowBackUp size="70%" />
                </ActionIcon>

                <ActionIcon
                    variant="subtle"
                    aria-label="renote"
                    c={theme.colors.dark[0]}
                >
                    <IconRepeat size="70%" />
                </ActionIcon>

                <Popover
                    opened={reactionPickerOpen}
                    onChange={setReactionPickerOpen}
                    position="top"
                    width={240}
                    withinPortal
                >
                    <Popover.Target>
                        <ActionIcon
                            variant="subtle"
                            aria-label="reaction"
                            c={theme.colors.dark[0]}
                            onClick={() => setReactionPickerOpen(true)}
                            loading={apiState.loading}
                        >
                            <IconMoodSmile size="70%" />
                        </ActionIcon>
                    </Popover.Target>

                    <Popover.Dropdown>
                        <Text size="sm" fw={500} mb="xs">リアクション</Text>
                        <Flex wrap="wrap" gap="xs">
                            {popularEmojis.map(emoji => (
                                <ActionIcon
                                    key={emoji}
                                    variant="light"
                                    onClick={() => handleAddReaction(emoji)}
                                >
                                    {emoji}
                                </ActionIcon>
                            ))}
                        </Flex>
                    </Popover.Dropdown>
                </Popover>

                <ActionIcon
                    variant="subtle"
                    aria-label="other"
                    c={theme.colors.dark[0]}
                >
                    <IconDots size="70%" />
                </ActionIcon>
            </Group>

            {renderReactions()}
        </Box>
    );
}