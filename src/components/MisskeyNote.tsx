import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import { Avatar, Container, Grid, Text } from "@mantine/core";
import { Note } from "misskey-js/entities.js";

export default function MisskeyNote({ note }: { note: Note }) {
    const misskeyApiClient = useMisskeyApiClient();

    return (
        <Container>
            <Grid>
                <Grid.Col span="content">
                    <Avatar src={note.user.avatarUrl} radius={'md'} m="xs" />
                </Grid.Col>
                <Grid.Col span="auto" mt="4">
                    <div>
                        <Text
                            fw="bold"
                            span
                        >
                            {note.user.username}
                        </Text>
                        <Text
                            fw="normal"
                            c="dimmed"
                            span
                        >
                            {note.user.host ? "@" + note.user.host : ''}
                        </Text>
                    </div>
                    <Text>
                        {note.text}
                    </Text>
                </Grid.Col>
            </Grid>
        </Container>
    );
}