// components/ThemeToggle.tsx
'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (<p>not mounted</p>)
    }

    return (
        <ActionIcon
            onClick={() => toggleColorScheme()}
            variant="outline"
            color={colorScheme === 'dark' ? 'yellow' : 'blue'}
            title="Toggle color scheme"
        >
            {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>
    );
}
