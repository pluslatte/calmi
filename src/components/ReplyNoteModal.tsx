import { Modal, Box, Paper, Divider } from "@mantine/core";
import { Note } from "misskey-js/entities.js";
import MisskeyNote from "./MisskeyNote";
import NoteComposer from "./NoteComposer";

interface ReplyNoteModalProps {
    note: Note | null;
    opened: boolean;
    onClose: () => void;
}

export default function ReplyNoteModal({ note, opened, onClose }: ReplyNoteModalProps) {
    // リプライ成功時の処理
    const handleSuccess = () => {
        onClose();
    };

    if (!note) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="返信"
            size="lg"
            centered
        >
            <Paper withBorder p="sm" mb="md" pb="xl">
                <MisskeyNote note={note} />
            </Paper>
            <Divider my="sm" />
            <Box mt="md">
                <NoteComposer
                    onSuccess={handleSuccess}
                    initialReplyId={note.id}
                    placeholder="返信を入力..."
                />
            </Box>
        </Modal>
    );
}