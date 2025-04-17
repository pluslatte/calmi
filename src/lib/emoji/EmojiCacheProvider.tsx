import React, { createContext, useContext, useState, useEffect } from 'react';

interface EmojiCacheContextType {
    // キャッシュされた絵文字のURLを取得する
    getEmojiUrl: (host: string | null, name: string) => string | null;
    // 絵文字のURLをキャッシュに追加する
    addEmojiToCache: (host: string | null, name: string, url: string) => void;
    // 読み込み状態
    loadingEmojis: { [key: string]: boolean };
}

// コンテキストの作成
const EmojiCacheContext = createContext<EmojiCacheContextType | null>(null);

// 絵文字のキーを生成する関数
const getEmojiKey = (host: string | null, name: string): string => {
    return `${host || 'local'}:${name}`;
};

// プロバイダーコンポーネント
export function EmojiCacheProvider({ children }: { children: React.ReactNode }) {
    // ローカルストレージにキャッシュされた絵文字
    const [emojiCache, setEmojiCache] = useState<Record<string, string>>({});
    // 読み込み中の絵文字
    const [loadingEmojis, setLoadingEmojis] = useState<Record<string, boolean>>({});
    // キャッシュの初期化済みフラグ
    const [initialized, setInitialized] = useState(false);

    // マウント時にローカルストレージからキャッシュを読み込む
    useEffect(() => {
        try {
            const cachedData = localStorage.getItem('emoji_cache');
            if (cachedData) {
                const parsedCache = JSON.parse(cachedData);
                setEmojiCache(parsedCache);
            }
        } catch (error) {
            console.error('Failed to load emoji cache from localStorage:', error);
        } finally {
            setInitialized(true);
        }
    }, []);

    // キャッシュ更新時にローカルストレージへ保存
    useEffect(() => {
        if (initialized && Object.keys(emojiCache).length > 0) {
            try {
                localStorage.setItem('emoji_cache', JSON.stringify(emojiCache));
            } catch (error) {
                console.error('Failed to save emoji cache to localStorage:', error);
            }
        }
    }, [emojiCache, initialized]);

    // 絵文字のURLを取得する関数
    const getEmojiUrl = (host: string | null, name: string): string | null => {
        const key = getEmojiKey(host, name);
        return emojiCache[key] || null;
    };

    // 絵文字のURLをキャッシュに追加する関数
    const addEmojiToCache = (host: string | null, name: string, url: string): void => {
        const key = getEmojiKey(host, name);
        setEmojiCache(prev => ({
            ...prev,
            [key]: url
        }));

        // 読み込み状態を更新
        setLoadingEmojis(prev => ({
            ...prev,
            [key]: false
        }));
    };

    // 絵文字の読み込み状態を設定する関数
    const setEmojiLoading = (host: string | null, name: string, isLoading: boolean): void => {
        const key = getEmojiKey(host, name);
        setLoadingEmojis(prev => ({
            ...prev,
            [key]: isLoading
        }));
    };

    // コンテキスト値
    const contextValue: EmojiCacheContextType = {
        getEmojiUrl,
        addEmojiToCache,
        loadingEmojis
    };

    return (
        <EmojiCacheContext.Provider value={contextValue}>
            {children}
        </EmojiCacheContext.Provider>
    );
}

// カスタムフック
export function useEmojiCache() {
    const context = useContext(EmojiCacheContext);
    if (!context) {
        throw new Error('useEmojiCache must be used within an EmojiCacheProvider');
    }
    return context;
}