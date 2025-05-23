import { Text } from "@mantine/core";
import { formatDistanceStrict, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect, useState } from "react";

export default function AutoRefreshTimestamp({ iso }: { iso: string }) {
    const [text, setText] = useState('');

    const update = () => {
        setText(formatDistanceStrict(parseISO(iso), new Date, { addSuffix: true, locale: ja }));
    }

    useEffect(() => {
        update();
        const interval = setInterval(update, 3000);
        return (() => {
            clearInterval(interval);
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Text
            span
            c="dimmed"
            size="xs"
            style={{
                whiteSpace: 'nowrap',
                display: 'block'
            }}
        >
            {text}
        </Text>
    )
}