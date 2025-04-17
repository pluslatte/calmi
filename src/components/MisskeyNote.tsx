import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import { Avatar, Box, Flex, Text, Group } from "@mantine/core";
import { Note } from "misskey-js/entities.js";
import AutoRefreshTimestamp from "./AutoRefreshTimestamp";
import MfmObject from "./MfmObject";
import * as mfm from 'mfm-js';
import { memo } from "react";

const MisskeyNote = memo(function MisskeyNote({ note }: { note: Note }) {
    const misskeyApiClient = useMisskeyApiClient();

    return (
        <Flex gap="sm" wrap="nowrap">
            {/* アバター */}
            <Avatar
                src={note.user.avatarUrl}
                radius="md"
                size="md"
                mt={3}
            />

            {/* ノートの本文エリア */}
            <Box miw={0} flex={1}>
                {/* ユーザー情報とタイムスタンプ */}
                <Flex justify="space-between" align="flex-start" mb={4}>
                    {/* ユーザー情報（2段表示） */}
                    <Box>
                        {/* ユーザー名 */}
                        <Text size="md" lineClamp={1}>
                            <MfmObject
                                mfmNodes={mfm.parse(note.user.name ? `**${note.user.name}**` : "")}
                                assets={{ host: note.user.host, emojis: note.emojis }}
                            />
                        </Text>
                        {/* ユーザーID */}
                        <Text size="xs" c="dimmed" lineClamp={1}>
                            @{note.user.username}
                            {note.user.host ? `@${note.user.host}` : ''}
                        </Text>
                    </Box>

                    {/* タイムスタンプ */}
                    <Box ml="auto">
                        <AutoRefreshTimestamp iso={note.createdAt} />
                    </Box>
                </Flex>

                {/* ノート本文 - 引用ブロックを含む可能性があるためdivでラップ */}
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
            </Box>
        </Flex>
    );
});

export default MisskeyNote;