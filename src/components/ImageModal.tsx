import { Modal, Image, ActionIcon, Box } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface ImageModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
    if (!imageUrl) return null;

    return (
        <Modal
            opened={!!imageUrl}
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
                    backgroundColor: 'transparent',
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
                <Image
                    src={imageUrl}
                    alt="拡大画像"
                    fit="contain"
                    style={{ maxHeight: '90vh' }}
                />
            </Box>
        </Modal>
    );
}