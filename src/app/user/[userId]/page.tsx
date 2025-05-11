// src/app/user/[userId]/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Tabs, LoadingOverlay, Text, Box, Button, Divider, Affix } from "@mantine/core";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { Note, UserDetailed } from "misskey-js/entities.js";
import UserProfile from "@/components/UserProfile";
import MisskeyNote from "@/components/MisskeyNote";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { useInfiniteScrollStore } from "@/stores/useInfiniteScrollStore";
import { IconNotes, IconPhoto, IconFile, IconArrowLeft } from "@tabler/icons-react";
import UserMediaGrid from "@/components/UserMediaGrid";
import { Virtuoso } from 'react-virtuoso';

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

    const previousUserIdRef = useRef<string | null>(null);
    const virtuosoRef = useRef(null);

    const { isLoading: isLoadingMore, initialize } = useInfiniteScrollStore();

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

            // メディア付きのノートを取得（withFiles=trueを使用）
            const mediaNotesData = await getUserNotes(id, {
                limit: 20,
                withFiles: true
            });

            // 画像ファイルのみのノートをフィルタリング
            const withMedia = mediaNotesData.filter(note =>
                note.files && note.files.length > 0 &&
                note.files.some(file => file.type.startsWith('image/'))
            );
            setMediaNotes(withMedia);

            // ファイル付きのノートはすでにAPIから取得済み（withFiles=true）
            const withFiles = mediaNotesData;
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
        if (!userId || !client) return [];

        try {
            // アクティブなタブに応じてロード処理を変更
            switch (activeTab) {
                case 'media': {
                    if (mediaNotes.length === 0) return [];
                    const lastNoteId = mediaNotes[mediaNotes.length - 1].id;
                    // メディア付きノートを取得（画像がある前提）
                    const moreNotes = await getUserNotes(userId, {
                        limit: 20,
                        untilId: lastNoteId,
                        withFiles: true
                    });
                    // 画像ファイルのみをフィルタリング
                    const newMediaNotes = moreNotes.filter(note =>
                        note.files && note.files.length > 0 &&
                        note.files.some(file => file.type.startsWith('image/'))
                    );
                    setMediaNotes(prev => [...prev, ...newMediaNotes]);
                    return newMediaNotes;
                }
                case 'files': {
                    if (filesNotes.length === 0) return [];
                    const lastNoteId = filesNotes[filesNotes.length - 1].id;
                    // ファイル付きノートを取得
                    const moreNotes = await getUserNotes(userId, {
                        limit: 20,
                        untilId: lastNoteId,
                        withFiles: true
                    });
                    setFilesNotes(prev => [...prev, ...moreNotes]);
                    return moreNotes;
                }
                default: {
                    // 通常のノート（全てのノート）
                    if (notes.length === 0) return [];
                    const lastNoteId = notes[notes.length - 1].id;
                    const moreNotes = await getUserNotes(userId, {
                        limit: 20,
                        untilId: lastNoteId
                    });
                    setNotes(prev => [...prev, ...moreNotes]);

                    // メディア付きとファイル付きのノートリストも更新
                    if (moreNotes.some(note => note.files && note.files.length > 0)) {
                        // ファイル付きのノートがある場合のみ処理
                        const newMediaNotes = moreNotes.filter(note =>
                            note.files && note.files.length > 0 &&
                            note.files.some(file => file.type.startsWith('image/'))
                        );
                        if (newMediaNotes.length > 0) {
                            setMediaNotes(prev => [...prev, ...newMediaNotes]);
                        }

                        const newFilesNotes = moreNotes.filter(note => note.files && note.files.length > 0);
                        if (newFilesNotes.length > 0) {
                            setFilesNotes(prev => [...prev, ...newFilesNotes]);
                        }
                    }

                    return moreNotes;
                }
            }
        } catch (error) {
            console.error('Failed to load more notes:', error);
            return [];
        }
    };

    // 単一のノートをレンダリングするための関数
    const renderItem = useCallback((index: number, activeTabType: string, notesList: Note[]) => {
        // 配列の範囲外をチェック
        if (index >= notesList.length) {
            return null;
        }

        const note = notesList[index];
        
        return (
            <Box key={activeTabType + "-note-" + note.id} p="xs">
                <MisskeyNote note={note} />
                <MisskeyNoteActions note={note} />
                <Divider mt="xs" />
            </Box>
        );
    }, []);

    // フッターとして読み込み中インジケーターをレンダリング
    const renderFooter = useCallback(() => {
        if (!isLoadingMore) {
            // アクティブなタブに応じてリストを選択
            const currentList = activeTab === 'media' 
                ? mediaNotes 
                : activeTab === 'files' 
                    ? filesNotes 
                    : notes;

            if (!loading && currentList.length > 0) {
                return (
                    <Text size="sm" c="dimmed" ta="center" py="sm">
                        これ以上の投稿はありません
                    </Text>
                );
            }
            return null;
        }
        
        return (
            <Text size="sm" c="dimmed" ta="center" py="sm">
                読み込み中...
            </Text>
        );
    }, [isLoadingMore, loading, activeTab, notes.length, mediaNotes.length, filesNotes.length]);

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
        <Container size="md" py="lg" style={{ position: 'relative', overflowX: 'hidden' }}>
            <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

            {user && <UserProfile user={user} />}

            {/* 固定位置の戻るボタンを追加 */}
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

            {/* 通常のノート表示 */}
            {activeTab === 'notes' && (
                notes.length > 0 ? (
                    <Box style={{ height: 'calc(100vh - 90px - 70px)', width: '100%' }}>
                        <Virtuoso
                            ref={virtuosoRef}
                            style={{ height: '100%', width: '100%' }}
                            totalCount={notes.length}
                            itemContent={(index) => renderItem(index, 'notes', notes)}
                            components={{
                                Footer: renderFooter,
                            }}
                            endReached={loadMoreNotes}
                            overscan={200}
                            increaseViewportBy={{ top: 300, bottom: 300 }}
                            initialTopMostItemIndex={0}
                        />
                    </Box>
                ) : (
                    <Text ta="center" py="md" c="dimmed">投稿はありません</Text>
                )
            )}

            {/* ファイル付きノート表示 */}
            {activeTab === 'files' && (
                filesNotes.length > 0 ? (
                    <Box style={{ height: 'calc(100vh - 90px - 70px)', width: '100%' }}>
                        <Virtuoso
                            ref={virtuosoRef}
                            style={{ height: '100%', width: '100%' }}
                            totalCount={filesNotes.length}
                            itemContent={(index) => renderItem(index, 'files', filesNotes)}
                            components={{
                                Footer: renderFooter,
                            }}
                            endReached={loadMoreNotes}
                            overscan={200}
                            increaseViewportBy={{ top: 300, bottom: 300 }}
                            initialTopMostItemIndex={0}
                        />
                    </Box>
                ) : (
                    <Text ta="center" py="md" c="dimmed">ファイル付きの投稿はありません</Text>
                )
            )}

            {/* メディア表示（UserMediaGridを使用） */}
            {activeTab === 'media' && (
                mediaNotes.length > 0 ? (
                    <Box style={{ height: 'calc(100vh - 90px - 70px)', width: '100%' }}>
                        <UserMediaGrid 
                            notes={mediaNotes} 
                            onLoadMore={loadMoreNotes}
                        />
                    </Box>
                ) : (
                    <Text ta="center" py="md" c="dimmed">メディア付きの投稿はありません</Text>
                )
            )}
        </Container>
    );
}