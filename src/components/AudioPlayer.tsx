'use client';

import { Box, Text, Paper, Group, ActionIcon } from "@mantine/core";
import { IconPlayerPlay, IconPlayerPause, IconVolume, IconVolume3 } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { DriveFile } from "misskey-js/entities.js";

interface AudioPlayerProps {
    file: DriveFile;
    compact?: boolean;
}

export default function AudioPlayer({ file, compact = false }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // オーディオタグから時間情報を更新
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);
        const handleError = () => setError("音声ファイルの読み込みに失敗しました");

        // イベントリスナーの設定
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        // クリーンアップ
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    // 再生/一時停止の切り替え
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => {
                console.error("Audio playback error:", err);
                setError("再生できませんでした");
            });
        }
        setIsPlaying(!isPlaying);
    };

    // ミュートの切り替え
    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.muted = !audio.muted;
        setIsMuted(!isMuted);
    };

    // 秒を「分:秒」形式に変換
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // プログレスバーの位置を計算
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    // コンパクトモード用のレイアウト
    if (compact) {
        return (
            <Paper p="xs" withBorder>
                <Group justify="space-between">
                    <Group gap="xs">
                        <ActionIcon
                            onClick={togglePlay}
                            variant="light"
                            color="cyan"
                            disabled={!!error}
                        >
                            {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
                        </ActionIcon>
                        <Text size="sm" lineClamp={1}>
                            {file.name || "音声ファイル"}
                        </Text>
                    </Group>
                    <audio ref={audioRef} src={file.url} preload="metadata" />
                </Group>
            </Paper>
        );
    }

    // フルサイズのプレイヤー
    return (
        <Paper p="md" withBorder>
            <Box>
                <Text fw={500} mb="xs" lineClamp={1}>
                    {file.name || "音声ファイル"}
                </Text>

                {error ? (
                    <Text c="red" size="sm">{error}</Text>
                ) : (
                    <>
                        <Group justify="space-between" gap="xs" mb="xs">
                            <ActionIcon
                                onClick={togglePlay}
                                variant="light"
                                color="cyan"
                                size="lg"
                            >
                                {isPlaying ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
                            </ActionIcon>

                            <Box style={{ flex: 1, margin: '0 10px' }}>
                                <Box
                                    style={{
                                        height: '4px',
                                        background: '#333',
                                        borderRadius: '2px',
                                        position: 'relative'
                                    }}
                                >
                                    <Box
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            height: '100%',
                                            width: `${progressPercent}%`,
                                            background: '#00acee',
                                            borderRadius: '2px'
                                        }}
                                    />
                                </Box>
                            </Box>

                            <ActionIcon
                                onClick={toggleMute}
                                variant="subtle"
                            >
                                {isMuted ? <IconVolume3 size={18} /> : <IconVolume size={18} />}
                            </ActionIcon>
                        </Group>

                        <Group justify="space-between">
                            <Text size="xs" c="dimmed">{formatTime(currentTime)}</Text>
                            <Text size="xs" c="dimmed">{formatTime(duration)}</Text>
                        </Group>
                    </>
                )}

                <audio ref={audioRef} src={file.url} preload="metadata" />
            </Box>
        </Paper>
    );
}