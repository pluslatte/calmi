import { Modal, Box, Paper, Divider } from "@mantine/core";
import { Note } from "misskey-js/entities.js";
import MisskeyNote from "./MisskeyNote";
import NoteComposer from "./NoteComposer";

interface QuoteNoteModalProps {
    note: Note | null;
    opened: boolean;
    onClose: () => void;
}

export default function QuoteNoteModal({ note, opened, onClose }: QuoteNoteModalProps) {
    // 引用リノート成功時の処理
    const handleSuccess = () => {
        onClose();
    };

    if (!note) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="引用リノート"
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
                    initialQuoteNoteId={note.id}
                    placeholder="引用コメントを入力..."
                />
            </Box>
        </Modal>
    );
}