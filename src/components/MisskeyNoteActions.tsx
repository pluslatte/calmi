import { Group, Box, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconArrowBackUp, IconRepeat, IconHeart, IconDots } from "@tabler/icons-react";

export default function MisskeyNoteActions() {
    const { colorScheme } = useMantineColorScheme();

    return (
        <Group gap="xl">
            <Box w="32px" />
            <ActionIcon variant="subtle" aria-label="reply" color={colorScheme === 'dark' ? 'white' : 'black'}>
                <IconArrowBackUp size="70%" />
            </ActionIcon>
            <ActionIcon variant="subtle" aria-label="renote" color={colorScheme === 'dark' ? 'white' : 'black'}>
                <IconRepeat size="70%" />
            </ActionIcon>
            <ActionIcon variant="subtle" aria-label="reaction" color={colorScheme === 'dark' ? 'white' : 'black'}>
                <IconHeart size="70%" />
            </ActionIcon>
            <ActionIcon variant="subtle" aria-label="other" color={colorScheme === 'dark' ? 'white' : 'black'}>
                <IconDots size="70%" />
            </ActionIcon>
        </Group>
    );
}