import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

const useConfirmationModal = (onConfirm: () => Promise<void>) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        await onConfirm().catch(error => {
            setIsLoading(false);
            throw error;
        });
        close();
        setIsLoading(false);
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
