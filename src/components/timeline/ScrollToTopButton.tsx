import { Box, Button, Transition } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";

export function ScrollToTopButton({
    show,
    rightOffset,
    onClick
}: {
    show: boolean;
    rightOffset: number | null;
    onClick: () => void;
}) {
    if (rightOffset === null) return null;

    return (
        <Box
            style={{
                position: 'fixed',
                bottom: 24,
                right: rightOffset,
                zIndex: 1000,
            }}
        >
            <Transition mounted={show} transition="slide-up" duration={200} timingFunction="ease">
                {(styles) => (
                    <Button
                        leftSection={<IconArrowUp size={16} />}
                        style={styles}
                        onClick={onClick}
                        variant="light"
                    >
                        上へ戻る
                    </Button>
                )}
            </Transition>
        </Box>
    );
}