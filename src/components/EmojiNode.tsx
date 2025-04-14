import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import { Text } from "@mantine/core";
import { useEffect, useState } from "react";

export default function EmojiNode({ name, assets }: { name: string, assets: { host: string | null; emojis?: { [key: string]: string | undefined } } }) {
    const misskeyApiClient = useMisskeyApiClient();
    const [emojiData, setEmojiData] = useState<{ url: string; alt: string } | null>(null);

    const getEmojiData = async (emojiCode: string, host: string | null): Promise<{ url: string; alt: string }> => {
        if (assets.emojis) {
            const url = assets.emojis[emojiCode];
            if (url) {
                return { url: url, alt: emojiCode };
            }
        }
        if (!host) {
            // if host is local
            const got = await misskeyApiClient.request('emoji', { name: emojiCode });
            return { url: got.url, alt: got.name };
        }
        // if host is remote
        const got = await fetch(`https://${host}/api/emoji?name=${emojiCode}`, {
            method: 'GET'
        });
        const json: { url: string; name: string; } = await got.json();
        return { url: json.url, alt: json.name };
    }


    useEffect(() => {
        let cancelled = false;
        getEmojiData(name, assets.host).then(data => {
            if (!cancelled) setEmojiData(data);
        });

        return () => {
            cancelled = true;
        }
    }, [name, assets.host])

    if (!emojiData) {
        return <Text span>{`:${name}:`}</Text> //Loading...
    }

    return (
        <img
            src={emojiData.url}
            alt={emojiData.alt}
            style={{ height: "1em", verticalAlign: "middle" }}
        />
    );
}