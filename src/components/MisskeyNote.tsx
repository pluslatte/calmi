import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import { Avatar, Box, Flex, Text } from "@mantine/core";
import { Note } from "misskey-js/entities.js";
import AutoRefreshTimestamp from "./AutoRefreshTimestamp";
import MfmObject from "./MfmObject";
import * as mfm from 'mfm-js';
import { memo } from "react";


const MisskeyNote = memo(function MisskeyNote({ note }: { note: Note }) {
    const misskeyApiClient = useMisskeyApiClient();

    return (
        <Flex align="start" gap="sm" wrap="nowrap">
            <Avatar src={note.user.avatarUrl} radius={'md'} m="xs" />
            <Box miw={0} mt="4" flex={1}>
                <Flex justify="space-between" align="center" wrap="nowrap" miw={0}>
                    <Flex gap="xs" wrap="nowrap" align="center" miw={0} flex={1}>
                        <Text
                            fw="bold"
                            truncate="end"
                            maw="100%"
                        >
                            {note.user.username}
                        </Text>
                        <Text
                            fw="normal"
                            c="dimmed"
                            truncate="end"
                            maw="100%"
                        >
                            {note.user.host ? "@" + note.user.host : ''}
                        </Text>
                    </Flex>
                    <Box style={{ flexShrink: 0 }}>
                        <AutoRefreshTimestamp iso={note.createdAt} />
                    </Box>
                </Flex>
                <Box maw="100%" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {note.text ? <MfmObject mfmNodes={mfm.parse(note.text)} assets={{ host: note.user.host, emojis: note.user.emojis }} /> : <></>}
                </Box>
            </Box>
        </Flex>
    );
});
export default MisskeyNote;