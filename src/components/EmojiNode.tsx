import { useMisskeyService } from "@/contexts/MisskeyContext";
import { Text } from "@mantine/core";
import { useEffect, useState } from "react";

export default function EmojiNode({ name, assets }: { name: string, assets: { host: string | null; emojis?: { [key: string]: string | undefined } } }) {
    const { service } = useMisskeyService();
    const [emojiData, setEmojiData] = useState<{ url: string; alt: string } | null>(null);

    const getEmojiData = async (emojiCode: string, host: string | null): Promise<{ url: string; alt: string } | null> => {
        if (!service) return null;

        const apiClient = service.getApiClient();

        if (assets.emojis) {
            const url = assets.emojis[emojiCode];
            if (url) {
                return { url: url, alt: emojiCode };
            }
        }
        if (!host) {
            // if host is local
            try {
                const got = await apiClient.request('emoji', { name: emojiCode });
                return { url: got.url, alt: got.name };
            } catch (error) {
                console.error('Failed to fetch emoji:', error);
                return null;
            }
        }
        // if host is remote
        try {
            const got = await fetch(`https://${host}/api/emoji?name=${emojiCode}`, {
                method: 'GET'
            });
            if (!got.ok) return null;
            const json: { url: string; name: string; } = await got.json();
            return { url: json.url, alt: json.name };
        } catch (error) {
            console.error('Failed to fetch remote emoji:', error);
            return null;
        }
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