import { Modal, Group, Button, Text } from "@mantine/core";

interface Props {
    opened: boolean;
    close: () => void;
    onclick: () => void | Promise<void>;
    title?: string;
    message?: string;
}

const ConfirmationModal = ({
    opened,
    close,
    onclick,
    title,
    message,
}: Props
) => {
    return (
        <Modal opened={opened} onClose={close} title={title}>
            <Text mb="md">
                {message}
            </Text>
            <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={close}>
                    キャンセル
                </Button>
                <Button
                    color="red"
                    onClick={onclick}
                >
                    確定
                </Button>
            </Group>
        </Modal>
    )
}

export default ConfirmationModal;