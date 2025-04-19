import { Modal, Box, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import VideoPlayer from "./VideoPlayer";
import { DriveFile } from "misskey-js/entities.js";

interface VideoModalProps {
    file: DriveFile | null;
    onClose: () => void;
}

export default function VideoModal({ file, onClose }: VideoModalProps) {
    if (!file) return null;

    return (
        <Modal
            opened={!!file}
            onClose={onClose}
            size="xl"
            padding={0}
            withCloseButton={false}
            centered
            styles={{
                body: {
                    padding: 0,
                },
                content: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    boxShadow: 'none',
                }
            }}
        >
            <Box style={{ position: 'relative' }}>
                <ActionIcon
                    variant="filled"
                    color="dark"
                    radius="xl"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 10
                    }}
                >
                    <IconX size={18} />
                </ActionIcon>
                <VideoPlayer
                    file={file}
                    autoPlay={true}
                    controls={true}
                    muted={false}
                />
            </Box>
        </Modal>
    );
}