import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Text } from "@mantine/core";
import { useEffect, useState } from "react";

export default function EmojiNode({ name, assets }: { name: string, assets: { host: string | null; emojis?: { [key: string]: string | undefined } } }) {
    const { getEmoji } = useMisskeyApiStore();
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
            const emojiData = await getRemoteEmojiUrl(host, emojiCode);
            return emojiData;
        } catch (err) {
            console.error('Failed to fetch remote emoji:', err);
            throw err;
        }
    }

    // リモートインスタンスの種類を判別し、適切なエンドポイントを使用する関数
    const getRemoteEmojiUrl = async (host: string, emojiCode: string): Promise<{ url: string; alt: string }> => {
        // まずMisskeyのAPIを試す
        try {
            const response = await fetch(`https://${host}/api/emoji?name=${emojiCode}`, {
                method: 'GET'
            });

            if (response.ok) {
                const json = await response.json();
                return { url: json.url, alt: json.name };
            }
        } catch (err) {
            console.log(`Misskey emoji API failed for ${host}: ${err}`);
            // エラーを無視して次の方法を試す
        }

        // Mastodonのカスタム絵文字APIを試す
        try {
            const response = await fetch(`https://${host}/api/v1/custom_emojis`, {
                method: 'GET'
            });

            if (response.ok) {
                const emojis = await response.json();
                const foundEmoji = emojis.find((emoji: any) => emoji.shortcode === emojiCode);

                if (foundEmoji) {
                    return { url: foundEmoji.url, alt: foundEmoji.shortcode };
                }
            }
        } catch (err) {
            console.log(`Mastodon emoji API failed for ${host}: ${err}`);
        }

        // 両方失敗した場合はエラーをスロー
        throw new Error(`リモート絵文字 ${emojiCode} をインスタンス ${host} から取得できませんでした`);
    };

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