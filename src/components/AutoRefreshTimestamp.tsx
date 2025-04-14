import { Text } from "@mantine/core";
import { formatDistanceStrict, parseISO } from "date-fns";
import { useEffect, useState } from "react";

export default function AutoRefreshTimestamp({ iso }: { iso: string }) {
    const [text, setText] = useState('');

    const update = () => {
        setText(formatDistanceStrict(new Date(), parseISO(iso), { addSuffix: true }));
    }

    useEffect(() => {
        update();
        const interval = setInterval(update, 3000);
        return (() => {
            clearInterval(interval);
        });
    }, []);

    return (
        <Text span c="dimmed">
            {text}
        </Text>
    )
}