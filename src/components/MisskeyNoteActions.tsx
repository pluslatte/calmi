import { Group, Box, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconArrowBackUp, IconRepeat, IconHeart, IconDots } from "@tabler/icons-react";

export default function MisskeyNoteActions() {
    const { colorScheme } = useMantineColorScheme();
    const iconColor = colorScheme === 'dark' ? 'white' : 'black';

    return (
        <Group gap="xl" mt={4} mb={4}>
            <ActionIcon
                variant="subtle"
                aria-label="reply"
                color={iconColor}
            >
                <IconArrowBackUp size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="renote"
                color={iconColor}
            >
                <IconRepeat size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="reaction"
                color={iconColor}
            >
                <IconHeart size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="other"
                color={iconColor}
            >
                <IconDots size="70%" />
            </ActionIcon>
        </Group>
    );
}