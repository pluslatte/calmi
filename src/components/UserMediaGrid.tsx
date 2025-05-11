import { SimpleGrid, Image, AspectRatio, Box, Paper, Text, ActionIcon, Tooltip, Flex } from "@mantine/core";
import { Note, DriveFile } from "misskey-js/entities.js";
import { useState, useEffect, useCallback } from "react";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";
import AudioPlayer from "./AudioPlayer";
import { IconPlayerPlay, IconExternalLink, IconFile } from "@tabler/icons-react";
import { VirtuosoGrid } from 'react-virtuoso';

interface UserMediaGridProps {
    notes: Note[];
    onLoadMore?: () => void;
}

export default function UserMediaGrid({ notes, onLoadMore }: UserMediaGridProps) {
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<DriveFile | null>(null);
    const [mediaFiles, setMediaFiles] = useState<DriveFile[]>([]);

    // ファイルタイプを確認するヘルパー関数
    const isImage = (file: DriveFile) =>
        file.type.startsWith('image/') && !file.type.includes('gif');
    const isGif = (file: DriveFile) =>
        file.type === 'image/gif';
    const isVideo = (file: DriveFile) =>
        file.type.startsWith('video/');
    const isAudio = (file: DriveFile) =>
        file.type.startsWith('audio/');

    // ノートが変更されたときにメディアリストを更新
    useEffect(() => {
        // 一意のメディアファイルを取得（IDに基づいて重複を排除）
        const uniqueMediaFiles = notes.reduce((acc: Record<string, DriveFile>, note) => {
            if (note.files && note.files.length > 0) {
                note.files.forEach(file => {
                    // 未追加のIDのみを追加
                    if (!acc[file.id]) {
                        acc[file.id] = file;
                    }
                });
            }
            return acc;
        }, {});

        // オブジェクトから配列に変換
        setMediaFiles(Object.values(uniqueMediaFiles));
    }, [notes]);

    // 画像モーダルを開く
    const openImageModal = (url: string) => {
        setModalImageUrl(url);
    };

    // 動画モーダルを開く
    const openVideoModal = (file: DriveFile) => {
        setVideoFile(file);
    };

    // 単一のメディアアイテムをレンダリングする関数
    const renderMediaItem = useCallback((file: DriveFile) => {
        // 画像ファイルの場合
        if (isImage(file)) {
            return (
                <Paper
                    withBorder
                    p={0}
                    radius="sm"
                    pos="relative"
                    style={{ overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => openImageModal(file.url)}
                >
                    <AspectRatio ratio={1}>
                        <Image
                            src={file.thumbnailUrl || file.url}
                            alt=""
                            fit="cover"
                        />
                    </AspectRatio>
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
            );
        }

        // GIFの場合
        if (isGif(file)) {
            return (
                <Paper
                    withBorder
                    p={0}
                    radius="sm"
                    pos="relative"
                    style={{ overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => window.open(file.url, '_blank')}
                >
                    <AspectRatio ratio={1}>
                        <Image
                            src={file.thumbnailUrl || file.url}
                            alt=""
                            fit="cover"
                        />
                    </AspectRatio>
                    <Text
                        size="xs"
                        px="xs"
                        py="3px"
                        bg="rgba(0,0,0,0.6)"
                        c="white"
                        pos="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                    >
                        GIF
                    </Text>
                </Paper>
            );
        }

        // 動画ファイルの場合
        if (isVideo(file)) {
            return (
                <Paper
                    withBorder
                    p={0}
                    radius="sm"
                    pos="relative"
                    style={{ overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => openVideoModal(file)}
                >
                    <AspectRatio ratio={1}>
                        {file.thumbnailUrl ? (
                            <Image
                                src={file.thumbnailUrl}
                                alt=""
                                fit="cover"
                            />
                        ) : (
                            <Flex
                                bg="dark"
                                w="100%"
                                h="100%"
                                align="center"
                                justify="center"
                            >
                                <IconPlayerPlay size={40} color="#fff" />
                            </Flex>
                        )}
                    </AspectRatio>
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
                        pos="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                    >
                        Video
                    </Text>
                </Paper>
            );
        }

        // オーディオファイルの場合
        if (isAudio(file)) {
            return (
                <Paper
                    withBorder
                    p={0}
                    radius="sm"
                    pos="relative"
                    style={{
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <AspectRatio ratio={1} style={{ flex: 1 }} bg="#f0f0f0">
                        <Box pt={"xl"} py={8} px={8} bg="white">
                            <AudioPlayer
                                file={file}
                                compact={true}
                            />
                        </Box>
                    </AspectRatio>
                    <Text
                        size="xs"
                        px="xs"
                        py="3px"
                        bg="rgba(0,0,0,0.6)"
                        c="white"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0
                        }}
                    >
                        Audio
                    </Text>
                </Paper>
            );
        }

        // その他のファイルの場合
        return (
            <Paper
                withBorder
                p={0}
                radius="sm"
                pos="relative"
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => window.open(file.url, '_blank')}
            >
                <AspectRatio ratio={1}>
                    <Flex
                        w="100%"
                        h="100%"
                        align="center"
                        justify="center"
                        direction="column"
                        gap="10px"
                        p="15px"
                    >
                        <IconFile size={40} color="#555" />
                        <Tooltip label={file.name}>
                            <Text size="xs" ta="center" lineClamp={2}>
                                {file.name || '不明なファイル'}
                            </Text>
                        </Tooltip>
                        <Text size="xs" c="dimmed">
                            {file.type.split('/')[1] || 'File'}
                        </Text>
                    </Flex>
                </AspectRatio>
                <Text
                    size="xs"
                    px="xs"
                    py="3px"
                    bg="rgba(0,0,0,0.6)"
                    c="white"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0
                    }}
                >
                    File
                </Text>
            </Paper>
        );
    }, [isImage, isGif, isVideo, isAudio, openImageModal, openVideoModal]);

    // 画像モーダルを閉じる
    const closeImageModal = () => {
        setModalImageUrl(null);
    };

    // 動画モーダルを閉じる
    const closeVideoModal = () => {
        setVideoFile(null);
    };

    // グリッドアイテムのレンダリング関数
    const ItemContainer = useCallback(
        (props: React.PropsWithChildren<any>) => {
            return (
                <div {...props} style={{ margin: "4px", height: "auto" }}>
                    {props.children}
                </div>
            );
        },
        []
    );

    return (
        <>
            {mediaFiles.length === 0 ? (
                <Box py="md">メディアはありません</Box>
            ) : (
                <VirtuosoGrid
                    style={{ height: '100%' }}
                    totalCount={mediaFiles.length}
                    overscan={200}
                    components={{
                        Item: ItemContainer,
                    }}
                    itemContent={index => renderMediaItem(mediaFiles[index])}
                    listClassName="grid-list"
                    endReached={onLoadMore}
                />
            )}

            {/* スタイルを追加 */}
            <style jsx global>{`
                .grid-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    grid-gap: 8px;
                    padding: 8px;
                }
            `}</style>

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
        </>
    );
}