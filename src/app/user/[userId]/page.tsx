'use client';

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Container, Tabs, LoadingOverlay, Text, Box, ScrollArea } from "@mantine/core";
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { User, Note, UserDetailed } from "misskey-js/entities.js";
import UserProfile from "@/components/UserProfile";
import MisskeyNote from "@/components/MisskeyNote";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { useInfiniteScrollStore } from "@/stores/useInfiniteScrollStore";
import { IconNotes, IconPhoto, IconFile } from "@tabler/icons-react";
import UserMediaGrid from "@/components/UserMediaGrid";

export default function UserPage() {
    const params = useParams();
    const userId = params.userId as string;
    const { getUserProfile, getUserNotes } = useMisskeyApiStore();
    const [user, setUser] = useState<UserDetailed | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [mediaNotes, setMediaNotes] = useState<Note[]>([]);
    const [filesNotes, setFilesNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>("notes");

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const { isLoading: isLoadingMore, initialize, useInfiniteScroll } = useInfiniteScrollStore();

    // ユーザー情報の取得
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                const userInfo = await getUserProfile(userId);
                setUser(userInfo);

                // 最初のノート一覧をロード
                const userNotes = await getUserNotes(userId, { limit: 20 });
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
        };

        if (userId) {
            fetchUserData();
        }

        // クリーンアップ
        return () => {
            initialize();
        };
    }, [userId, getUserProfile, getUserNotes, initialize]);

    // 通常ノートの無限スクロール
    const loadMoreNotes = async () => {
        if (notes.length === 0) return [];

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
                return <UserMediaGrid notes={mediaNotes} />;
            case 'files':
                return filesNotes.map(note => (
                    <Box key={note.id} mb="md">
                        <MisskeyNote note={note} />
                        <MisskeyNoteActions note={note} />
                    </Box>
                ));
            default:
                return notes.map(note => (
                    <Box key={note.id} mb="md">
                        <MisskeyNote note={note} />
                        <MisskeyNoteActions note={note} />
                    </Box>
                ));
        }
    };

    if (error) {
        return (
            <Container size="sm" py="lg">
                <Text c="red">{error}</Text>
            </Container>
        );
    }

    return (
        <Container size="md" py="lg" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />

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

            <ScrollArea viewportRef={scrollAreaRef} h="calc(100vh - 300px)" type="auto">
                {displayNotes()}
                <div ref={observerRef} style={{ height: 1 }} />

                {isLoadingMore && (
                    <Text size="sm" c="dimmed" ta="center" py="sm">
                        読み込み中...
                    </Text>
                )}

                {!isLoadingMore && !loading && (
                    <Text size="sm" c="dimmed" ta="center" py="sm">
                        {notes.length > 0 ? 'これ以上の投稿はありません' : '投稿がありません'}
                    </Text>
                )}
            </ScrollArea>
        </Container>
    );
}