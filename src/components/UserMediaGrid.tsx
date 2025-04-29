import { SimpleGrid, Image, AspectRatio, Box, Paper } from "@mantine/core";
import { Note, DriveFile } from "misskey-js/entities.js";
import { useState, useEffect } from "react";
import ImageModal from "./ImageModal";

interface UserMediaGridProps {
    notes: Note[];
}

export default function UserMediaGrid({ notes }: UserMediaGridProps) {
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
    const [allImages, setAllImages] = useState<DriveFile[]>([]);

    // ノートが変更されたときに画像リストを更新
    useEffect(() => {
        // 一意の画像ファイルを取得（IDに基づいて重複を排除）
        const uniqueImages = notes.reduce((acc: Record<string, DriveFile>, note) => {
            if (note.files && note.files.length > 0) {
                note.files.forEach(file => {
                    // 画像ファイルのみ追加し、未追加のIDのみを追加
                    if (file.type.startsWith('image/') && !file.type.includes('gif') && !acc[file.id]) {
                        acc[file.id] = file;
                    }
                });
            }
            return acc;
        }, {});
        
        // オブジェクトから配列に変換
        setAllImages(Object.values(uniqueImages));
    }, [notes]);

    // 画像モーダルを開く
    const openImageModal = (url: string) => {
        setModalImageUrl(url);
    };

    // 画像モーダルを閉じる
    const closeImageModal = () => {
        setModalImageUrl(null);
    };

    if (allImages.length === 0) {
        return <Box py="md">メディアはありません</Box>;
    }

    return (
        <>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
                {allImages.map((file) => (
                    <Paper
                        key={file.id}
                        withBorder
                        p={0}
                        style={{
                            overflow: 'hidden',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                        onClick={() => openImageModal(file.url)}
                    >
                        <AspectRatio ratio={1}>
                            <Image
                                src={file.thumbnailUrl}
                                alt=""
                                fit="cover"
                            />
                        </AspectRatio>
                    </Paper>
                ))}
            </SimpleGrid>

            <ImageModal
                imageUrl={modalImageUrl}
                onClose={closeImageModal}
            />
        </>
    );
}