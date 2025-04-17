import { Group, Box, ActionIcon, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { IconArrowBackUp, IconRepeat, IconHeart, IconDots } from "@tabler/icons-react";

export default function MisskeyNoteActions() {
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();

    // テーマに基づいて色を設定
    const isDark = colorScheme === 'dark';

    return (
        <Group gap="xl" mt={4} mb={4}>
            <ActionIcon
                variant="subtle"
                aria-label="reply"
                // variant="subtle"を使用するとカラースキームに自動的に従いますが、明示的に指定することも可能
                c={isDark ? theme.colors.dark[0] : theme.colors.gray[7]}
            >
                <IconArrowBackUp size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="renote"
                c={isDark ? theme.colors.dark[0] : theme.colors.gray[7]}
            >
                <IconRepeat size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="reaction"
                c={isDark ? theme.colors.dark[0] : theme.colors.gray[7]}
            >
                <IconHeart size="70%" />
            </ActionIcon>

            <ActionIcon
                variant="subtle"
                aria-label="other"
                c={isDark ? theme.colors.dark[0] : theme.colors.gray[7]}
            >
                <IconDots size="70%" />
            </ActionIcon>
        </Group>
    );
}