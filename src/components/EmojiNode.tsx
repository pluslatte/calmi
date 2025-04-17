import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import { Text } from "@mantine/core";
import { useEffect, useState } from "react";

export default function EmojiNode({ name, assets }: { name: string, assets: { host: string | null; emojis?: { [key: string]: string | undefined } } }) {
    const { getEmoji } = useMisskeyApiClient();
    const [emojiData, setEmojiData] = useState<{ url: string; alt: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getEmojiData = async (emojiCode: string, host: string | null): Promise<{ url: string; alt: string }> => {
        if (assets.emojis) {
            const url = assets.emojis[emojiCode];
            if (url) {
                return { url: url, alt: emojiCode };
            }
        }

        if (!host) {
            // ローカルインスタンスの絵文字
            try {
                const got = await getEmoji(emojiCode);
                return { url: got.url, alt: got.name };
            } catch (err) {
                console.error('Failed to fetch emoji:', err);
                throw err;
            }
        }

        // リモートインスタンスの絵文字
        try {
            const got = await fetch(`https://${host}/api/emoji?name=${emojiCode}`, {
                method: 'GET'
            });

            if (!got.ok) {
                throw new Error(`Failed to fetch emoji: ${got.status}`);
            }

            const json: { url: string; name: string; } = await got.json();
            return { url: json.url, alt: json.name };
        } catch (err) {
            console.error('Failed to fetch remote emoji:', err);
            throw err;
        }
    }

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        getEmojiData(name, assets.host)
            .then(data => {
                if (!cancelled) {
                    setEmojiData(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setError(`絵文字を読み込めませんでした: ${err.message}`);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        }
    }, [name, assets.host])

    if (error) {
        return <Text span c="red" fs="italic">{`:${name}:`}</Text>
    }

    if (!emojiData || loading) {
        return <Text span>{`:${name}:`}</Text> // Loading...
    }

    return (
        <img
            src={emojiData.url}
            alt={emojiData.alt}
            style={{ height: "1em", verticalAlign: "middle" }}
        />
    );
}