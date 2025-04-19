import { Group, ActionIcon, useMantineTheme, Box, Popover, Paper, Text, Flex, rgba } from "@mantine/core";
import { IconArrowBackUp, IconRepeat, IconDots, IconMoodSmile } from "@tabler/icons-react";
import { useState } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Note } from "misskey-js/entities.js";
import { notifications } from "@mantine/notifications";
import EmojiNode from "./EmojiNode";

interface MisskeyNoteActionsProps {
    note: Note;
}

export default function MisskeyNoteActions({ note }: MisskeyNoteActionsProps) {
    const theme = useMantineTheme();
    const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
    const { createReaction, deleteReaction, apiState } = useMisskeyApiStore();

    // リノートチェック：リノートかつテキストがない場合は純粋なリノート（リポストのみ）と判断
    const isPlainRepost = note.renote && !note.text;

    // リアクション対象のノートID
    // 純粋なリノートの場合は元のノートID、そうでない場合は現在のノートID
    const targetNoteId = isPlainRepost ? note.renote!.id : note.id;

    // リノート先であるかどうかに合わせた、描画するノートのホスト情報
    const targetNoteHost = isPlainRepost ? note.renote!.user.host : note.user.host;

    // リノート先であるかどうかにあわせた、描画するノートの絵文字データ
    const targetNoteEmojis = isPlainRepost ? note.renote!.emojis : note.emojis;

    // よく使われるリアクション絵文字のリスト
    const popularEmojis = ["👍", "❤️", "😆", "🎉", "🤔", "👏", "🙏", "🥺", "😮", "🫡"];

    // リアクション追加
    const handleAddReaction = async (emoji: string) => {
        try {
            await createReaction(targetNoteId, emoji);
            setReactionPickerOpen(false);
            notifications.show({
                title: 'リアクション成功',
                message: `${emoji} を追加しました`,
                color: 'green'
            });
        } catch (error) {
            console.error("リアクション追加エラー:", error);
            notifications.show({
                title: 'リアクション失敗',
                message: 'リアクションの追加に失敗しました',
                color: 'red'
            });
        }
    };

    // リアクション削除
    const handleRemoveReaction = async (emoji: string) => {
        try {
            await deleteReaction(targetNoteId, emoji);
            notifications.show({
                title: 'リアクション削除',
                message: `${emoji} を削除しました`,
                color: 'gray'
            });
        } catch (error) {
            console.error("リアクション削除エラー:", error);
            notifications.show({
                title: 'リアクション削除失敗',
                message: 'リアクションの削除に失敗しました',
                color: 'red'
            });
        }
    };

    // ノートのリアクション情報を取得（純粋なリノートの場合は元のノートのリアクション情報を使用）
    const noteReactions = isPlainRepost ? note.renote!.reactions : note.reactions;
    const myReaction = isPlainRepost ? note.renote!.myReaction : note.myReaction;

    // リアクション表示部分
    const renderReactions = () => {
        if (!noteReactions || Object.keys(noteReactions).length === 0) {
            return null;
        }

        return (
            <Flex wrap="wrap" gap="xs" mt={8}>
                {Object.entries(noteReactions).map(([reaction, count]) => {
                    // 絵文字コードかUnicode絵文字かを判定
                    const isCustomEmoji = reaction.startsWith(':') && reaction.endsWith(':');
                    const emojiName = isCustomEmoji ? reaction.slice(1).split('@')[0] : reaction;
                    const emojiHost = isCustomEmoji
                        ?
                        reaction.slice(1).split('@')[1].slice(0, -1) !== '.' // NOTE: さすがに嘘だろそれは でもこれで動くからいいや
                            ?
                            reaction.slice(1).split('@')[1].slice(0, -1)
                            :
                            targetNoteHost
                        :
                        '';
                    console.log("fetching: " + emojiName + " from " + emojiHost);

                    return (
                        <Paper
                            key={reaction}
                            px="xs"
                            py="3px"
                            radius="xl"
                            withBorder
                            style={{
                                cursor: "pointer",
                                opacity: myReaction === reaction ? 1 : 0.8,
                                backgroundColor: myReaction === reaction
                                    ? rgba(theme.colors.cyan[8], 0.1)
                                    : undefined,
                                borderColor: myReaction === reaction
                                    ? theme.colors.cyan[5]
                                    : undefined,
                            }}
                            onClick={() => {
                                if (myReaction === reaction) {
                                    handleRemoveReaction(reaction);
                                } else {
                                    handleAddReaction(reaction);
                                }
                            }}
                        >
                            <Group gap={6} wrap="nowrap">
                                {isCustomEmoji ? (
                                    <EmojiNode
                                        name={emojiName}
                                        assets={{
                                            host: emojiHost,
                                            emojis: targetNoteEmojis,
                                        }}
                                    />
                                ) : (
                                    <Text span>{reaction}</Text>
                                )}
                                <Text span size="xs" c="dimmed">{count}</Text>
                            </Group>
                        </Paper>
                    );
                })}
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