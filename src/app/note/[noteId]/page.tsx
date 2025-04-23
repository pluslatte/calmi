'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, LoadingOverlay, Text, Box, Button, Divider, Affix } from "@mantine/core";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Note } from "misskey-js/entities.js";
import MisskeyNote from "@/components/MisskeyNote";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowLeft } from "@tabler/icons-react";

export default function NotePage() {
    const params = useParams();
    const router = useRouter();
    const noteId = params.noteId as string;
    const { getNote, client } = useMisskeyApiStore();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // データ取得関数
    const fetchNoteData = async (id: string) => {
        if (!client) {
            setError('APIクライアントが初期化されていません');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const noteData = await getNote(id);
            setNote(noteData);
        } catch (error) {
            console.error('Failed to fetch note data:', error);
            setError('ノート情報の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // ノートIDが変更されたときのデータ再取得
    useEffect(() => {
        if (noteId && client) {
            fetchNoteData(noteId);
        }
    }, [noteId, client]);

    // エラー時の表示
    if (error) {
        return (
            <Container size="sm" py="lg">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.back()}
                    mb="md"
                >
                    戻る
                </Button>
                <Text c="red">{error}</Text>
                {client ? (
                    <Button
                        onClick={() => fetchNoteData(noteId)}
                        variant="outline"
                        color="red"
                        mt="md"
                    >
                        再試行
                    </Button>
                ) : (
                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        mt="md"
                    >
                        ダッシュボードへ戻る
                    </Button>
                )}
            </Container>
        );
    }

    return (
        <Container size="md" py="lg" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

            {/* 固定位置の戻るボタン */}
            <Affix position={{ top: 45, left: 16 }} zIndex={100}>
                <Button
                    variant="filled"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.back()}
                    opacity={0.8}
                    radius="xl"
                >
                    戻る
                </Button>
            </Affix>

            {note && (
                <Box maw="calc(100vw - 38px)" mt={50}>
                    <Box mb="md">
                        <MisskeyNote note={note} />
                        <MisskeyNoteActions note={note} />
                        <Divider mt="xs" />
                    </Box>
                </Box>
            )}

            {!loading && !note && !error && (
                <Text ta="center" py="md" c="dimmed">ノートが見つかりませんでした</Text>
            )}
        </Container>
    );
}
