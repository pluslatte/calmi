import { SimpleGrid, Image, AspectRatio, Box, Paper } from "@mantine/core";
import { Note, DriveFile } from "misskey-js/entities.js";
import { useState } from "react";
import ImageModal from "./ImageModal";

interface UserMediaGridProps {
    notes: Note[];
}

export default function UserMediaGrid({ notes }: UserMediaGridProps) {
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

    // すべての画像ファイルを取得
    const allImages = notes.reduce((acc: DriveFile[], note) => {
        if (note.files && note.files.length > 0) {
            const imageFiles = note.files.filter(file =>
                file.type.startsWith('image/') && !file.type.includes('gif')
            );
            return [...acc, ...imageFiles];
        }
        return acc;
    }, []);

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