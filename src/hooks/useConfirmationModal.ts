import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

const useConfirmationModal = (onConfirm: () => Promise<void>) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            close();
        } catch (error) {
            // エラーハンドリングは onConfirm 側で行う想定
            console.error('Confirmation action failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        opened,
        open,
        close,
        handleConfirm,
        isLoading,
    };
};

export default useConfirmationModal;
