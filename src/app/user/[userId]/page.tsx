// src/app/user/[userId]/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Tabs, LoadingOverlay, Text, Box, ScrollArea, Button, Divider } from "@mantine/core";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Note, UserDetailed } from "misskey-js/entities.js";
import UserProfile from "@/components/UserProfile";
import MisskeyNote from "@/components/MisskeyNote";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { useInfiniteScrollStore } from "@/stores/useInfiniteScrollStore";
import { IconNotes, IconPhoto, IconFile, IconArrowLeft } from "@tabler/icons-react";
import UserMediaGrid from "@/components/UserMediaGrid";

export default function UserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    const { getUserProfile, getUserNotes, client } = useMisskeyApiStore();
    const [user, setUser] = useState<UserDetailed | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [mediaNotes, setMediaNotes] = useState<Note[]>([]);
    const [filesNotes, setFilesNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>("notes");

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const previousUserIdRef = useRef<string | null>(null);

    const { isLoading: isLoadingMore, initialize, useInfiniteScroll } = useInfiniteScrollStore();

    // データ取得関数をuseCallbackでメモ化
    const fetchUserData = useCallback(async (id: string) => {
        if (!client) {
            setError('APIクライアントが初期化されていません');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const userInfo = await getUserProfile(id);
            setUser(userInfo);

            // 最初のノート一覧をロード
            const userNotes = await getUserNotes(id, { limit: 20 });
            setNotes(userNotes);

            // メディア付きのノートをフィルタリング
            const withMedia = userNotes.filter(note =>
                note.files && note.files.length > 0 &&
                note.files.some(file => file.type.startsWith('image/'))
            );
            setMediaNotes(withMedia);

            // ファイル付きのノートをフィルタリング
            const withFiles = userNotes.filter(note => note.files && note.files.length > 0);
            setFilesNotes(withFiles);

        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setError('ユーザー情報の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [getUserProfile, getUserNotes, client]);

    // ユーザーIDが変更されたときのデータ再取得
    useEffect(() => {
        // userIdが変わった場合、または前回の取得時にクライアントがなかった場合に再取得
        if (userId && (userId !== previousUserIdRef.current || (client && !previousUserIdRef.current))) {
            fetchUserData(userId);
            previousUserIdRef.current = userId;
        }

        // クリーンアップ
        return () => {
            initialize();
        };
    }, [userId, fetchUserData, initialize, client]);

    // 通常ノートの無限スクロール
    const loadMoreNotes = async () => {
        if (notes.length === 0 || !userId || !client) return [];

        const lastNoteId = notes[notes.length - 1].id;
        try {
            const moreNotes = await getUserNotes(userId, { limit: 20, untilId: lastNoteId });
            setNotes(prev => [...prev, ...moreNotes]);

            // メディア付きとファイル付きのリストも更新
            const newMediaNotes = moreNotes.filter(note =>
                note.files && note.files.length > 0 &&
                note.files.some(file => file.type.startsWith('image/'))
            );
            setMediaNotes(prev => [...prev, ...newMediaNotes]);

            const newFilesNotes = moreNotes.filter(note => note.files && note.files.length > 0);
            setFilesNotes(prev => [...prev, ...newFilesNotes]);

            return moreNotes;
        } catch (error) {
            console.error('Failed to load more notes:', error);
            return [];
        }
    };

    const { observerRef } = useInfiniteScroll(loadMoreNotes);

    // 表示するノートリスト
    const displayNotes = () => {
        switch (activeTab) {
            case 'media':
                return mediaNotes.length > 0 ? (
                    <UserMediaGrid notes={mediaNotes} />
                ) : (
                    <Text ta="center" py="md" c="dimmed">メディア付きの投稿はありません</Text>
                );
            case 'files':
                return filesNotes.length > 0 ? (
                    filesNotes.map(note => (
                        <Box key={note.id} mb="md">
                            <MisskeyNote note={note} />
                            <MisskeyNoteActions note={note} />
                            <Divider mt="xs" />
                        </Box>
                    ))
                ) : (
                    <Text ta="center" py="md" c="dimmed">ファイル付きの投稿はありません</Text>
                );
            default:
                return notes.length > 0 ? (
                    notes.map(note => (
                        <Box key={note.id} mb="md">
                            <MisskeyNote note={note} />
                            <MisskeyNoteActions note={note} />
                            <Divider mt="xs" />
                        </Box>
                    ))
                ) : (
                    <Text ta="center" py="md" c="dimmed">投稿はありません</Text>
                );
        }
    };

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
                        onClick={() => fetchUserData(userId)}
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

            <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => router.back()}
                mb="md"
            >
                戻る
            </Button>

            {user && <UserProfile user={user} />}

            <Tabs value={activeTab} onChange={setActiveTab} mb="md">
                <Tabs.List>
                    <Tabs.Tab value="notes" leftSection={<IconNotes size={16} />}>
                        ノート
                    </Tabs.Tab>
                    <Tabs.Tab value="media" leftSection={<IconPhoto size={16} />}>
                        メディア
                    </Tabs.Tab>
                    <Tabs.Tab value="files" leftSection={<IconFile size={16} />}>
                        ファイル
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>

            <ScrollArea viewportRef={scrollAreaRef} h="calc(100vh - 90px - 70px)" type="scroll">
                <Box pr="xs"> {/* 右側のパディングを追加してコンテンツが横にはみ出すのを防ぐ */}
                    {displayNotes()}
                    <div ref={observerRef} style={{ height: 1 }} />

                    {isLoadingMore && (
                        <Text size="sm" c="dimmed" ta="center" py="sm">
                            読み込み中...
                        </Text>
                    )}

                    {!isLoadingMore && !loading && notes.length > 0 && (
                        <Text size="sm" c="dimmed" ta="center" py="sm">
                            これ以上の投稿はありません
                        </Text>
                    )}
                </Box>
            </ScrollArea>
        </Container>
    );
}