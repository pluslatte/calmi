import { Group, ActionIcon, useMantineTheme, Box, Popover, Paper, Text, Flex, rgba, Menu, Modal, Button } from "@mantine/core";
import { IconArrowBackUp, IconRepeat, IconDots, IconMoodSmile, IconCheck, IconLink, IconMessageCircle, IconTrash } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Note } from "misskey-js/entities.js";
import { notifications } from "@mantine/notifications";
import EmojiNode from "./EmojiNode";
import QuoteNoteModal from "./QuoteNoteModal";
import ReplyNoteModal from "./ReplyNoteModal";

// プロップからonReactionUpdateを削除
interface MisskeyNoteActionsProps {
    note: Note;
}

export default function MisskeyNoteActions({ note }: MisskeyNoteActionsProps) {
    const [localNote, setLocalNote] = useState<Note>(note);
    const [copySuccess, setCopySuccess] = useState(false);
    const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isOwnNote, setIsOwnNote] = useState(false);

    const { createReaction, deleteReaction, apiState, createRenote, deleteNote, getUserInfo } = useMisskeyApiStore();
    const theme = useMantineTheme();

    // noteプロップが変更されたら内部状態を更新
    useEffect(() => {
        setLocalNote(note);
    }, [note]);

    // コンポーネントがマウントされたときに自分のユーザー情報を取得し、
    // 表示されているノートが自分のものかどうかを判定する
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const user = await getUserInfo();
                // 投稿者のIDと現在のユーザーIDを比較して自分のノートかを判定
                const noteUserId = isPlainRepost ? localNote.renote?.user.id : localNote.user.id;
                setIsOwnNote(user.id === noteUserId);
            } catch (error) {
                console.error("ユーザー情報取得エラー:", error);
            }
        };

        fetchUserInfo();
    }, [localNote]);

    // リノートチェック：リノートかつテキストがない場合は純粋なリノート（リポストのみ）と判断
    const isPlainRepost = localNote.renote && !localNote.text;

    // 操作対象のノートID
    const targetNoteId = isPlainRepost ? localNote.renote!.id : localNote.id;

    // リノート先であるかどうかにあわせた、描画するノートの絵文字データ
    const targetNoteEmojis = isPlainRepost ? localNote.renote!.emojis : localNote.emojis;

    // よく使われるリアクション絵文字のリスト
    const popularEmojis = ["👍", "❤️", "😆", "🎉", "🤔", "👏", "🙏", "🥺", "😮", "🫡"];

    // 更新処理の簡素化（onReactionUpdateを削除）
    const updateNoteState = (updatedNote: Note) => {
        try {
            // コンポーネントの内部状態のみを更新
            if (isPlainRepost) {
                const updatedLocalNote = { ...localNote };
                updatedLocalNote.renote = updatedNote;
                setLocalNote(updatedLocalNote);
            } else {
                setLocalNote(updatedNote);
            }
        } catch (error) {
            console.error("ノート状態更新エラー:", error);
        }
    };

    // オプティミスティックUI用のヘルパー関数
    const generateOptimisticReactionNote = (emoji: string, isAdding: boolean) => {
        // 元のノートをコピー
        const noteToUpdate = isPlainRepost ? { ...localNote.renote! } : { ...localNote };

        // リアクションを更新
        if (isAdding) {
            // リアクション追加のシミュレーション
            if (noteToUpdate.reactions && noteToUpdate.reactions[emoji]) {
                noteToUpdate.reactions = {
                    ...noteToUpdate.reactions,
                    [emoji]: noteToUpdate.reactions[emoji] + 1
                };
            } else {
                noteToUpdate.reactions = {
                    ...noteToUpdate.reactions || {},
                    [emoji]: 1
                };
            }
            noteToUpdate.myReaction = emoji;
        } else {
            // リアクション削除のシミュレーション
            if (noteToUpdate.reactions && noteToUpdate.reactions[emoji]) {
                if (noteToUpdate.reactions[emoji] > 1) {
                    noteToUpdate.reactions = {
                        ...noteToUpdate.reactions,
                        [emoji]: noteToUpdate.reactions[emoji] - 1
                    };
                } else {
                    const { [emoji]: _, ...restReactions } = noteToUpdate.reactions;
                    noteToUpdate.reactions = restReactions;
                }
            }
            noteToUpdate.myReaction = null;
        }

        // リノートの場合は元のノートを更新
        if (isPlainRepost) {
            return { ...localNote, renote: noteToUpdate };
        }

        return noteToUpdate;
    };

    // 統合されたリアクション処理関数
    const handleReaction = async (emoji: string, isAdding: boolean) => {
        try {
            // UI応答を即座に返す（オプティミスティックUI）
            const optimisticNote = generateOptimisticReactionNote(emoji, isAdding);
            updateNoteState(optimisticNote);

            // ポップオーバーを閉じる（追加時のみ）
            if (isAdding) {
                setReactionPickerOpen(false);
            }

            // 実際のAPI呼び出し
            if (isAdding) {
                await createReaction(targetNoteId, emoji);
            } else {
                await deleteReaction(targetNoteId, emoji);
            }

            // APIコールが成功すれば通知表示
            notifications.show({
                title: isAdding ? 'リアクション成功' : 'リアクション削除',
                message: isAdding ? `${emoji} を追加しました` : `${emoji} を削除しました`,
                color: isAdding ? 'green' : 'gray'
            });
        } catch (error) {
            console.error(isAdding ? "リアクション追加エラー:" : "リアクション削除エラー:", error);

            // エラーの場合は元の状態に戻す
            const revertedNote = generateOptimisticReactionNote(emoji, !isAdding);
            updateNoteState(revertedNote);

            notifications.show({
                title: isAdding ? 'リアクション失敗' : 'リアクション削除失敗',
                message: isAdding ? 'リアクションの追加に失敗しました' : 'リアクションの削除に失敗しました',
                color: 'red'
            });
        }
    };

    // リアクション追加関数（シンプル化）
    const handleAddReaction = async (emoji: string) => {
        handleReaction(emoji, true);
    };

    // リアクション削除関数（シンプル化）
    const handleRemoveReaction = async (emoji: string) => {
        handleReaction(emoji, false);
    };

    // ノートのリアクション情報を取得
    const noteReactions = isPlainRepost ? localNote.renote!.reactions : localNote.reactions;
    const myReaction = isPlainRepost ? localNote.renote!.myReaction : localNote.myReaction;

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
                            reaction.slice(1).split('@')[1].slice(0, -1) // remote サーバーのドメインが入るはず
                            :
                            localStorage.getItem('misskey_server')?.slice(8) // ここはローカルサーバーのドメイン
                        :
                        '';

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
                                            host: emojiHost ? emojiHost : "",
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

    // ノートURLをコピーする機能を追加
    const copyNoteUrl = () => {
        // サーバーのURLを取得
        const serverUrl = localStorage.getItem('misskey_server') || 'https://virtualkemomimi.net';

        // ノートURLを生成（実際のノートIDを使用）
        const noteUrl = `${serverUrl}/notes/${targetNoteId}`;

        // クリップボードにコピー
        navigator.clipboard.writeText(noteUrl)
            .then(() => {
                setCopySuccess(true);
                notifications.show({
                    title: 'コピー成功',
                    message: 'ノートのURLをクリップボードにコピーしました',
                    color: 'green',
                    icon: <IconCheck size={16} />,
                    autoClose: 2000,
                });

                // 2秒後にチェックマークを元に戻す
                setTimeout(() => {
                    setCopySuccess(false);
                }, 2000);
            })
            .catch(err => {
                notifications.show({
                    title: 'コピー失敗',
                    message: 'URLのコピーに失敗しました',
                    color: 'red',
                });
                console.error('URLのコピーに失敗しました:', err);
            });
    };

    const renoteNote = async () => {
        try {
            await createRenote(targetNoteId);

            // リノート成功時の処理
            notifications.show({
                title: 'リノート成功',
                message: 'リノートが成功しました',
                color: 'green',
            });
        } catch (error) {
            console.error("リノートエラー:", error);
            notifications.show({
                title: 'リノート失敗',
                message: 'リノートに失敗しました',
                color: 'red'
            });
        }
    }

    // ノート削除機能
    const handleDeleteNote = async () => {
        try {
            await deleteNote(localNote.id);

            // 削除成功時の処理
            notifications.show({
                title: 'ノート削除',
                message: 'ノートを削除しました',
                color: 'green',
            });

            // モーダルを閉じる
            setDeleteModalOpen(false);

            // ここで削除後の処理（例: タイムラインのリフレッシュなど）を行うことも可能
            // 現在の実装ではページのリロードなどは行わない
        } catch (error) {
            console.error("ノート削除エラー:", error);
            notifications.show({
                title: 'ノート削除失敗',
                message: 'ノートの削除に失敗しました',
                color: 'red'
            });
        }
    }


    return (
        <Box>
            <Group gap="xl" mt={4} mb={4}>
                <Box w="md" />

                <ActionIcon
                    variant="subtle"
                    aria-label="reply"
                    c={theme.colors.dark[0]}
                    onClick={() => setReplyModalOpen(true)}
                >
                    <IconArrowBackUp size="70%" />
                </ActionIcon>

                <Menu shadow="md" width={200} position="bottom-end" withinPortal>
                    <Menu.Target>
                        <ActionIcon
                            variant="subtle"
                            aria-label="renote"
                            c={note.visibility === "followers" || note.visibility === "specified" ? theme.colors.dark[3] : theme.colors.dark[0]}
                            loading={apiState.loading}
                            disabled={note.visibility === "followers" || note.visibility === "specified"}
                        >
                            <IconRepeat size="70%" />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconRepeat size={14} />}
                            onClick={renoteNote}
                        >
                            リノート
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconMessageCircle size={14} />}
                            onClick={() => setQuoteModalOpen(true)}
                        >
                            引用リノート
                        </Menu.Item>
                        {/* 将来的に他のアクションをここに追加できます */}
                    </Menu.Dropdown>
                </Menu>

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

                {/* ドロップダウンメニュー */}
                <Menu shadow="md" width={200} position="bottom-end" withinPortal>
                    <Menu.Target>
                        <ActionIcon
                            variant="subtle"
                            aria-label="other"
                            c={theme.colors.dark[0]}
                        >
                            <IconDots size="70%" />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>ノートアクション</Menu.Label>
                        <Menu.Item
                            leftSection={copySuccess ? <IconCheck size={14} /> : <IconLink size={14} />}
                            onClick={copyNoteUrl}
                        >
                            URLをコピー
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconMessageCircle size={14} />}
                            component="a"
                            href={`/note/${targetNoteId}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                // 既に同じノートページにいる場合はページ遷移をキャンセル
                                if (window.location.pathname === `/note/${targetNoteId}`) {
                                    e.preventDefault();
                                    window.scrollTo(0, 0);
                                }
                            }}
                        >
                            ノートを表示
                        </Menu.Item>
                        {/* 自分のノートの場合のみ、削除オプションを表示 */}
                        {isOwnNote && (
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                onClick={() => setDeleteModalOpen(true)}
                                color="red"
                            >
                                削除
                            </Menu.Item>
                        )}
                    </Menu.Dropdown>
                </Menu>
            </Group>

            {renderReactions()}

            {/* 削除確認モーダル */}
            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="ノートの削除"
                centered
                size="sm"
            >
                <Text mb="md">このノートを削除してもよろしいですか？この操作は取り消せません。</Text>
                <Flex justify="flex-end" gap="md">
                    <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>キャンセル</Button>
                    <Button color="red" onClick={handleDeleteNote} loading={apiState.loading}>削除</Button>
                </Flex>
            </Modal>

            {/* 引用リノートモーダル */}
            <QuoteNoteModal
                note={note}
                opened={quoteModalOpen}
                onClose={() => setQuoteModalOpen(false)}
            />

            {/* 返信モーダル */}
            <ReplyNoteModal
                note={note}
                opened={replyModalOpen}
                onClose={() => setReplyModalOpen(false)}
            />
        </Box>
    );
}