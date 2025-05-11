'use client';

import { Box, Text, Paper, Group, ActionIcon, Slider, Tooltip } from "@mantine/core";
import { IconPlayerPlay, IconPlayerPause, IconVolume, IconVolume3, IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { DriveFile } from "misskey-js/entities.js";
import { useAudioSettingsStore } from "@/stores/useAudioSettingsStore";

interface AudioPlayerProps {
    file: DriveFile;
    compact?: boolean;
}

export default function AudioPlayer({ file, compact = false }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const {
        volume,
        muted,
        setVolume,
        toggleMute,
    } = useAudioSettingsStore();

    // オーディオタグから時間情報を更新
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // 初期状態を適用
        audio.volume = volume;
        audio.muted = muted;

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
    const handleToggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        toggleMute();
        audio.muted = !muted;
    };

    const handleVolumeChange = (value: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        setVolume(value);
        audio.volume = value;
    };

    const handleSeek = (value: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = (value / 100) * duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
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
                    <Tooltip label={formatTime(currentTime) + ' / ' + formatTime(duration)}>
                        <Box w="100%">
                            <Slider
                                value={progressPercent}
                                onChange={handleSeek}
                                size="xs"
                                color="cyan"
                                disabled={!!error || duration === 0}
                            />
                        </Box>
                    </Tooltip>
                    <Group justify="space-between" wrap="nowrap">
                        <ActionIcon
                            size="xs"
                            onClick={() => handleVolumeChange(Math.max(0, volume - 0.1))}
                        >
                            <IconMinus size={14} />
                        </ActionIcon>
                        <Slider
                            value={volume}
                            onChange={handleVolumeChange}
                            min={0}
                            max={1}
                            step={0.01}
                            size="xs"
                            w={80}
                        />
                        <ActionIcon
                            size="xs"
                            onClick={() => handleVolumeChange(Math.min(1, volume + 0.1))}
                        >
                            <IconPlus size={14} />
                        </ActionIcon>
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
                                <Slider
                                    value={progressPercent}
                                    onChange={handleSeek}
                                    size="sm"
                                    color="cyan"
                                    disabled={!!error || duration === 0}
                                    label={formatTime(currentTime)}
                                    labelAlwaysOn={false}
                                />
                            </Box>

                            <ActionIcon
                                onClick={handleToggleMute}
                                variant="subtle"
                            >
                                {muted ? <IconVolume3 size={18} /> : <IconVolume size={18} />}
                            </ActionIcon>

                            <Paper
                                style={{
                                    width: 150,
                                }}
                            >
                                <Group justify="space-between" wrap="nowrap">
                                    <ActionIcon
                                        size="xs"
                                        onClick={() => handleVolumeChange(Math.max(0, volume - 0.1))}
                                    >
                                        <IconMinus size={14} />
                                    </ActionIcon>
                                    <Slider
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        size="xs"
                                        w={80}
                                    />
                                    <ActionIcon
                                        size="xs"
                                        onClick={() => handleVolumeChange(Math.min(1, volume + 0.1))}
                                    >
                                        <IconPlus size={14} />
                                    </ActionIcon>
                                </Group>
                            </Paper>
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