import { useEmojiCache } from "@/lib/emoji/EmojiCacheProvider";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Text, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";

export default function EmojiNode({ name, assets }: { name: string, assets: { host: string | null; emojis?: { [key: string]: string | undefined } } }) {
    const { getEmoji } = useMisskeyApiStore();
    const { getEmojiUrl, addEmojiToCache } = useEmojiCache();
    const [emojiData, setEmojiData] = useState<{ url: string; alt: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const getEmojiData = async (emojiCode: string, host: string | null): Promise<{ url: string; alt: string }> => {
        // 1. キャッシュをチェック
        const cachedUrl = getEmojiUrl(host, emojiCode);
        if (cachedUrl) {
            return { url: cachedUrl, alt: emojiCode };
        }

        // 2. ローカルの絵文字セットをチェック
        if (assets.emojis) {
            const url = assets.emojis[emojiCode];
            if (url) {
                // キャッシュに追加して返す
                addEmojiToCache(host, emojiCode, url);
                return { url, alt: emojiCode };
            }
        }

        // 3. ローカルインスタンスの絵文字
        if (!host) {
            try {
                const got = await getEmoji(emojiCode);
                // キャッシュに追加して返す
                addEmojiToCache(null, emojiCode, got.url);
                return { url: got.url, alt: got.name };
            } catch (err) {
                console.error('Failed to fetch emoji:', err);
                throw err;
            }
        }

        // 4. リモートインスタンスの絵文字はプロキシ経由で取得
        try {
            const response = await fetch(`/api/proxy-emoji?host=${encodeURIComponent(host)}&name=${encodeURIComponent(emojiCode)}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
                throw new Error(errorData.error || `エラー: ${response.status}`);
            }

            const data = await response.json();
            // キャッシュに追加して返す
            addEmojiToCache(host, emojiCode, data.url);
            return { url: data.url, alt: data.name || emojiCode };
        } catch (err) {
            console.error(`Failed to fetch remote emoji from ${host}:`, err);
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
                    console.error(`Error loading emoji :${name}:`, err);
                    setError(`${err.message || 'エラー'}`);
                    setLoading(false);

                    // エラー時のフォールバック画像を設定
                    const fallbackUrl = `https://via.placeholder.com/20x20?text=${encodeURIComponent(name)}`;
                    setEmojiData({ url: fallbackUrl, alt: name });
                }
            });

        return () => {
            cancelled = true;
        }
    }, [name, assets.host, retryCount]);

    // リトライ機能
    const handleRetry = () => {
        setRetryCount(count => count + 1);
    };

    // 画像読み込みエラー時の処理
    const handleImageError = () => {
        const fallbackUrl = `https://via.placeholder.com/20x20?text=${encodeURIComponent(name)}`;
        setEmojiData(prev => {
            if (prev && prev.url !== fallbackUrl) {
                return { ...prev, url: fallbackUrl };
            }
            return prev;
        });
    };

    if (!emojiData || loading) {
        return <Text span c="dimmed">{`:${name}:`}</Text>; // Loading state
    }

    return (
        <Tooltip label={`:${name}:`} position="bottom">
            <span style={{ display: 'inline-block' }}>
                <img
                    src={emojiData.url}
                    alt={emojiData.alt}
                    style={{
                        height: "1.2em",
                        verticalAlign: "middle",
                        opacity: error ? 0.5 : 1
                    }}
                    onClick={error ? handleRetry : undefined}
                    onError={handleImageError}
                />
                {error && (
                    <Text
                        span
                        size="xs"
                        c="red"
                        style={{
                            position: 'absolute',
                            fontSize: '0.5em',
                            marginLeft: '-0.5em'
                        }}
                    >
                        !
                    </Text>
                )}
            </span>
        </Tooltip>
    );
}