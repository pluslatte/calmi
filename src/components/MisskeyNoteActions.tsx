import { Group, ActionIcon, useMantineTheme } from "@mantine/core";
import { IconArrowBackUp, IconRepeat, IconHeart, IconDots } from "@tabler/icons-react";

export default function MisskeyNoteActions() {
    const theme = useMantineTheme();

    return (
        <Group gap="xl" mt={4} mb={4}>
            <ActionIcon
                variant="subtle"
                aria-label="reply"
                // variant="subtle"を使用するとカラースキームに自動的に従いますが、明示的に指定することも可能
                c={theme.colors.dark[0]}
            >
                <IconArrowBackUp size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="renote"
                c={theme.colors.dark[0]}
            >
                <IconRepeat size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="reaction"
                c={theme.colors.dark[0]}
            >
                <IconHeart size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="other"
                c={theme.colors.dark[0]}
            >
                <IconDots size="70%" />
            </ActionIcon>
        </Group>
    );
}