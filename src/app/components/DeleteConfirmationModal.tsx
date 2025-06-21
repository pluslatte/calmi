import { Modal, Group, Button, Text } from "@mantine/core";

interface Props {
    opened: boolean;
    close: () => void;
    onclick: () => void | Promise<void>;
    loading?: boolean;
}
const DeleteConfirmationModal = ({
    opened,
    close,
    onclick,
    loading = false,
}: Props
) => {
    return (
        <Modal opened={opened} onClose={close} title="アカウント削除の確認">
            <Text mb="md">
                このアカウントを削除してもよろしいですか？この操作は取り消せません。
            </Text>
            <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={close}>
                    キャンセル
                </Button>
                <Button
                    color="red"
                    onClick={onclick}
                    loading={loading}
                    disabled={loading}
                >
                    削除を確定
                </Button>
            </Group>
        </Modal>
    )
}

export default DeleteConfirmationModal;