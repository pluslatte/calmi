'use client';

import { Box, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { DriveFile } from "misskey-js/entities.js";

interface VideoPlayerProps {
    file: DriveFile;
    autoPlay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
}

export default function VideoPlayer({
    file,
    autoPlay = false,
    controls = true,
    loop = false,
    muted = true
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // コンポーネントがマウントされた時にエラーをリセット
        setError(null);
    }, [file]);

    // エラーハンドリング
    const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        console.error("Video loading error:", e);
        setError("動画の読み込みに失敗しました");
    };

    // 動画ロード成功時
    const handleLoadedData = () => {
        if (error) setError(null);
    };

    return (
        <Box style={{ width: '100%', position: 'relative' }}>
            {error ? (
                <Box
                    style={{
                        background: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}
                >
                    <Text c="red">{error}</Text>
                    <Text size="sm" c="dimmed" mt="sm">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                            ブラウザで開く
                        </a>
                    </Text>
                </Box>
            ) : (
                <video
                    ref={videoRef}
                    src={file.url}
                    poster={file.thumbnailUrl || undefined}
                    controls={controls}
                    autoPlay={autoPlay}
                    loop={loop}
                    muted={muted}
                    style={{
                        width: '100%',
                        maxHeight: '80vh',
                        borderRadius: '4px',
                        background: '#000'
                    }}
                    onError={handleError}
                    onLoadedData={handleLoadedData}
                />
            )}
        </Box>
    );
}