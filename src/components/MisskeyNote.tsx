import { Avatar, Box, Button, Collapse, Flex, Paper, Text } from "@mantine/core";
import { Note } from "misskey-js/entities.js";
import AutoRefreshTimestamp from "./AutoRefreshTimestamp";
import MfmObject from "./MfmObject";
import * as mfm from 'mfm-js';
import NoteAttachments from "./NoteAttachments";
import { memo, useState } from "react";
import { IconAlertTriangle, IconRepeat } from "@tabler/icons-react";
import Link from "next/link";
import { useUserSettingsStore } from "@/stores/useUserSettingsStore";

const MisskeyNote = memo(function MisskeyNote({ note }: { note: Note }) {
    // ユーザー設定からCW自動展開設定を取得
    const { autoExpandCw } = useUserSettingsStore();

    // CWの展開状態を管理するstate
    const [cwExpanded, setCwExpanded] = useState(autoExpandCw);

    // CWがあるかどうかをチェック
    const hasCw = note.cw !== null && note.cw !== undefined && note.cw !== '';

    // ノートの種類を判別
    const isRepost = note.renote && !note.text;
    const isQuote = note.renote && note.text;

    // リノートヘッダー コンポーネント
    const RepostHeader = () => (
        <Flex align="center" gap="xs" mb={6}>
            <IconRepeat size={16} opacity={0.7} />
            <Text size="xs" c="dimmed">
                {note.user.name || note.user.username} がリノート
            </Text>
        </Flex>
    );

    // 引用ノートコンポーネント
    const QuotedNote = ({ quotedNote }: { quotedNote: Note }) => (
        <Paper withBorder p="xs" mt="xs" bg="rgba(0,0,0,0.03)" style={{ borderRadius: '6px' }}>
            <Flex gap="sm" wrap="nowrap">
                <Avatar
                    src={quotedNote.user.avatarUrl}
                    radius="md"
                    size="sm"
                    mt={3}
                />
                <Box miw={0} flex={1}>
                    <Flex justify="space-between" align="center" mb={2}>
                        <Text size="sm" fw={600} lineClamp={1}>
                            {quotedNote.user.name || quotedNote.user.username}
                        </Text>
                        <AutoRefreshTimestamp iso={quotedNote.createdAt} />
                    </Flex>
                    <Text size="xs" c="dimmed" mb={4} lineClamp={1}>
                        @{quotedNote.user.username}
                        {quotedNote.user.host ? `@${quotedNote.user.host}` : ''}
                    </Text>
                    <Box>
                        <MfmObject
                            mfmNodes={mfm.parse(quotedNote.text ? quotedNote.text : "")}
                            assets={{
                                host: quotedNote.user.host,
                                emojis: quotedNote.user.emojis
                            }}
                        />
                    </Box>
                    {quotedNote.files && quotedNote.files.length > 0 && (
                        <NoteAttachments files={quotedNote.files} />
                    )}
                </Box>
            </Flex>
        </Paper>
    );

    if (isRepost && note.renote) {
        return (
            <>
                <RepostHeader />
                <MisskeyNote note={note.renote} />
            </>
        );
    }

    return (
        <Flex gap="sm" wrap="nowrap">
            {/* アバター */}
            <Link
                href={`/user/${note.user.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (note.user.id === window.location.pathname.split('/').pop()) {
                        e.preventDefault();
                        window.scrollTo(0, 0);
                    }
                }}
            >
                <Avatar
                    src={note.user.avatarUrl}
                    radius="md"
                    size="md"
                    mt={3}
                    style={{ cursor: 'pointer' }}
                />
            </Link>

            {/* ノートの本文エリア */}
            <Box miw={0} flex={1} style={{ maxWidth: '100%' }}>
                {/* ユーザー情報とタイムスタンプ */}
                <Flex justify="space-between" align="flex-start" mb={4}>
                    {/* ユーザー情報（2段表示） */}
                    <Box style={{ minWidth: 0, maxWidth: 'calc(100% - 80px)' }}>
                        {/* ユーザー名をリンクに */}
                        <Link
                            href={`/user/${note.user.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (note.user.id === window.location.pathname.split('/').pop()) {
                                    e.preventDefault();
                                    window.scrollTo(0, 0);
                                }
                            }}
                        >
                            <Text size="md" lineClamp={1} style={{
                                cursor: 'pointer', wordBreak: 'break-word', overflowWrap: 'break-word'
                            }}>
                                <MfmObject
                                    mfmNodes={mfm.parse(note.user.name ? `**${note.user.name}**` : "")}
                                    assets={{ host: note.user.host, emojis: note.emojis }}
                                />
                            </Text>
                        </Link>
                        {/* ユーザーID */}
                        <Text size="xs" c="dimmed" lineClamp={1} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            @{note.user.username}
                            {note.user.host ? `@${note.user.host}` : ''}
                        </Text>
                    </Box>

                    {/* タイムスタンプ */}
                    <Box>
                        <AutoRefreshTimestamp iso={note.createdAt} />
                    </Box>
                </Flex>

                {/* CW表示部分 - ここから新規追加 */}
                {hasCw && (
                    <Paper
                        withBorder
                        p="xs"
                        mb="xs"
                    >
                        <Flex align="center" gap="xs">
                            <IconAlertTriangle size={16} />
                            <Text size="sm" fw={500} style={{ flex: 1 }}>
                                {note.cw}
                            </Text>
                            <Button
                                size="xs"
                                variant="subtle"
                                c="dimmed"
                                onClick={() => setCwExpanded(!cwExpanded)}
                            >
                                {cwExpanded ? '隠す' : '表示する'}
                            </Button>
                        </Flex>
                    </Paper>
                )}

                {/* ノート本文 - CW対応に修正 */}
                <Collapse in={!hasCw || cwExpanded}>
                    <Box
                        maw="100%"
                        style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        <MfmObject
                            mfmNodes={mfm.parse(note.text ? note.text : "<small>（本文なし）</small>")}
                            assets={{
                                host: note.user.host,
                                emojis: note.user.emojis
                            }}
                        />
                    </Box>

                    {/* 添付ファイル - CW対応 */}
                    {note.files && note.files.length > 0 && (
                        <NoteAttachments files={note.files} />
                    )}

                    {/* 引用ノート */}
                    {isQuote && note.renote && (
                        <QuotedNote quotedNote={note.renote} />
                    )}
                </Collapse>
            </Box>
        </Flex>
    );
});

export default MisskeyNote;