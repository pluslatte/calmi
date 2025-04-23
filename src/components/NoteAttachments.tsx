'use client';

import { Box, Image, Paper, Text, Group, ActionIcon, Grid } from "@mantine/core";
import { IconFile, IconFileMusic, IconPlayerPlay, IconExternalLink, IconEye } from "@tabler/icons-react";
import { useState } from "react";
import { DriveFile } from "misskey-js/entities.js";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";
import AudioPlayer from "./AudioPlayer";

interface NoteAttachmentsProps {
    files: DriveFile[];
}

export default function NoteAttachments({ files }: NoteAttachmentsProps) {
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<DriveFile | null>(null);

    // ファイルタイプを確認するヘルパー関数
    const isImage = (file: DriveFile) =>
        file.type.startsWith('image/') && !file.type.includes('gif');
    const isGif = (file: DriveFile) =>
        file.type === 'image/gif';
    const isVideo = (file: DriveFile) =>
        file.type.startsWith('video/');
    const isAudio = (file: DriveFile) =>
        file.type.startsWith('audio/');

    // 画像モーダルを開く
    const openImageModal = (url: string) => {
        setModalImageUrl(url);
    };

    // 動画モーダルを開く
    const openVideoModal = (file: DriveFile) => {
        setVideoFile(file);
    };

    // 画像モーダルを閉じる
    const closeImageModal = () => {
        setModalImageUrl(null);
    };

    // 動画モーダルを閉じる
    const closeVideoModal = () => {
        setVideoFile(null);
    };

    if (!files || files.length === 0) {
        return null;
    }

    // ファイル数に応じてグリッドレイアウトを調整
    const getGridSpan = (index: number, total: number) => {
        if (total === 1) return 12; // 1つの場合は全幅
        if (total === 2) return 6;  // 2つの場合は半分ずつ
        if (total === 3) {
            return index === 0 ? 12 : 6; // 最初は全幅、残り2つは半分ずつ
        }
        if (total === 4) return 6; // 4つの場合は2x2グリッド
        return 4; // 5つ以上は3つ並び
    };

    return (
        <Box mt="xs">
            <Grid gutter="xs">
                {files.map((file, index) => {
                    const gridSpan = getGridSpan(index, files.length);

                    // 画像ファイルの場合
                    if (isImage(file)) {
                        return (
                            <Grid.Col key={file.id} span={{ base: 12, sm: gridSpan }}>
                                <Paper
                                    shadow="xs"
                                    p={0}
                                    withBorder
                                    style={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: '4px',
                                        height: gridSpan === 12 ? 300 : 150,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openImageModal(file.url);
                                    }}
                                >
                                    <Image
                                        src={file.thumbnailUrl || file.url}
                                        alt={file.name}
                                        height="100%"
                                        width="100%"
                                        fit="cover"
                                    />
                                    <ActionIcon
                                        variant="filled"
                                        color="dark"
                                        radius="xl"
                                        size="sm"
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            opacity: 0.7
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(file.url, '_blank');
                                        }}
                                    >
                                        <IconExternalLink size={14} />
                                    </ActionIcon>
                                </Paper>
                            </Grid.Col>
                        );
                    }

                    // GIFの場合
                    if (isGif(file)) {
                        return (
                            <Grid.Col key={file.id} span={{ base: 12, sm: gridSpan }}>
                                <Paper
                                    shadow="xs"
                                    p={0}
                                    withBorder
                                    style={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: '4px',
                                        height: gridSpan === 12 ? 300 : 150,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(file.url, '_blank');
                                    }}
                                >
                                    <Image
                                        src={file.thumbnailUrl || file.url}
                                        alt={file.name}
                                        height="100%"
                                        width="100%"
                                        fit="cover"
                                    />
                                    <Text
                                        size="xs"
                                        px="xs"
                                        py="3px"
                                        bg="rgba(0,0,0,0.6)"
                                        c="white"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0
                                        }}
                                    >
                                        GIF
                                    </Text>
                                </Paper>
                            </Grid.Col>
                        );
                    }

                    // 動画ファイルの場合
                    if (isVideo(file)) {
                        return (
                            <Grid.Col key={file.id} span={{ base: 12, sm: gridSpan }}>
                                <Paper
                                    shadow="xs"
                                    p={0}
                                    withBorder
                                    style={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: '4px',
                                        height: gridSpan === 12 ? 300 : 150,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openVideoModal(file);
                                    }}
                                >
                                    {file.thumbnailUrl ? (
                                        <Image
                                            src={file.thumbnailUrl}
                                            alt={file.name}
                                            height="100%"
                                            width="100%"
                                            fit="cover"
                                        />
                                    ) : (
                                        <Box
                                            bg="dark"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <IconPlayerPlay size={40} color="#fff" />
                                        </Box>
                                    )}
                                    <ActionIcon
                                        variant="filled"
                                        color="dark"
                                        radius="xl"
                                        size="lg"
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            opacity: 0.8
                                        }}
                                    >
                                        <IconPlayerPlay size={20} />
                                    </ActionIcon>
                                    <Text
                                        size="xs"
                                        px="xs"
                                        py="3px"
                                        bg="rgba(0,0,0,0.6)"
                                        c="white"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0
                                        }}
                                    >
                                        Video
                                    </Text>
                                </Paper>
                            </Grid.Col>
                        );
                    }

                    // 音声ファイルの場合
                    if (isAudio(file)) {
                        return (
                            <Grid.Col key={file.id} span={{ base: 12, sm: gridSpan }}>
                                <AudioPlayer
                                    file={file}
                                    compact={files.length > 1}
                                />
                            </Grid.Col>
                        );
                    }

                    // その他のファイル
                    return (
                        <Grid.Col key={file.id} span={{ base: 12, sm: gridSpan }}>
                            <Paper
                                shadow="xs"
                                p="md"
                                withBorder
                                style={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    minHeight: 70
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(file.url, '_blank');
                                }}
                            >
                                <Group>
                                    <IconFile size={24} />
                                    <Box>
                                        <Text size="sm" fw={500} lineClamp={1}>
                                            {file.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {file.type.split('/')[1] || 'File'}
                                        </Text>
                                    </Box>
                                </Group>
                            </Paper>
                        </Grid.Col>
                    );
                })}
            </Grid>

            {/* 画像モーダル */}
            <ImageModal
                imageUrl={modalImageUrl}
                onClose={closeImageModal}
            />
            {/* 動画モーダル */}
            <VideoModal
                file={videoFile}
                onClose={closeVideoModal}
            />
        </Box>
    );
}