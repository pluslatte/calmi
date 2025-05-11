// src/components/MisskeyTimeline.tsx
'use client';

import React, { memo, useEffect, useRef, useCallback, useState } from 'react';
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Button, Divider, Loader, Text, Transition } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowUp } from "@tabler/icons-react";
import SkippedNotesIndicator from "@/components/SkippedNotesIndicator";
import { useTimelineStore } from '@/stores/timeline/useTimelineStore';
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { useTimelineUiStore } from "@/stores/timeline/useTimelineUiStore";
import { TimelineType } from "@/types/misskey.types";
import { Virtuoso } from 'react-virtuoso';

const MisskeyTimeline = memo(function MisskeyTimeline({
    timelineType,
    containerRef
}: {
    timelineType: TimelineType;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const {
        client,
        getHomeTimeline,
        getHybridTimeline,
        getLocalTimeline,
        getGlobalTimeline,
        getNote
    } = useMisskeyApiStore();

    // Zustandストアからの状態とアクション
    const {
        notes,
        autoUpdateEnabled,
        isLoading,
        hasError,
        errorMessage,
        skippedNotesGroups,
        lastSwitchToAutoUpdateTime,
        initializeTimeline,
        cleanupTimeline,
        loadMoreNotes,
        setAutoUpdateEnabled,
        loadSkippedNotes,
    } = useTimelineStore();
    const {
        showScrollToTop,
        buttonRightOffset,
        initializeTimelineUi,
        updateButtonOffset,
    } = useTimelineUiStore();

    // useInfiniteScrollStoreの代わりにローカルステートを使用
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const lastLoadTimeRef = useRef<number>(0);
    const lastBoundaryIndexRef = useRef<number | null>(null);

    // 初期化処理
    useEffect(() => {
        console.log("MisskeyTimeline initialization effect running");

        if (!client) {
            console.log("Client not available, skipping initialization");
            return;
        }

        // タイムラインを初期化
        initializeTimeline(client, timelineType, getHomeTimeline, getHybridTimeline, getLocalTimeline, getGlobalTimeline);
        console.log(`Timeline initialized with type: ${timelineType}`);

        initializeTimelineUi();
        
        // 無限スクロール関連の状態をリセット
        setIsLoadingMore(false);
        lastLoadTimeRef.current = 0;
        
        // 境界インデックスをリセット
        lastBoundaryIndexRef.current = null;

        // 初期データのロード
        console.log("Loading initial timeline data...");
        loadMoreNotes()
            .then(() => {
                console.log(`Initial data loaded, notes count: ${notes.length}`);
                if (notes.length > 0) {
                    console.log(`First note ID: ${notes[0].id}`);
                }
            })
            .catch(error => {
                console.error("Error loading initial timeline data:", error);
            });

        // クリーンアップ
        return () => {
            console.log("Timeline component cleanup");
            cleanupTimeline();
        };
    }, [
        timelineType,
        client,
        initializeTimeline,
        initializeTimelineUi,
        cleanupTimeline,
        loadMoreNotes,
        getHomeTimeline,
        getHybridTimeline,
        getLocalTimeline,
        getGlobalTimeline
    ]);

    // ボタン表示位置の計算
    useEffect(() => {
        updateButtonOffset(containerRef);

        const handleResize = () => {
            updateButtonOffset(containerRef);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [containerRef, updateButtonOffset]);

    // 単一ノートをレンダリングする関数
    const renderItem = useCallback((index: number) => {
        // 配列の範囲外をチェック
        if (index >= notes.length) {
            console.log(`Index ${index} is out of bounds, returning null`);
            return null;
        }

        const note = notes[index];

        // このノートに関連するスキップ・グループを取得
        const relatedGroups = skippedNotesGroups
            .filter(group => group.referenceNoteId === note.id);

        // 関連するインジケーターをレンダリング
        const relatedIndicators = relatedGroups.map(group => {
            const groupIndex = skippedNotesGroups.findIndex(g =>
                g.timestamp === group.timestamp && g.referenceNoteId === group.referenceNoteId);

            return (
                <Box key={`skipped-${note.id}-${group.timestamp.getTime()}`}>
                    <SkippedNotesIndicator
                        count={group.count}
                        timestamp={group.timestamp}
                        groupIndex={groupIndex}
                        loadSkippedNotes={(groupIdx) => loadSkippedNotes(groupIdx, getNote)}
                        loadedNotes={group.loadedNotes}
                        isLoading={group.isLoading}
                    />
                </Box>
            );
        });

        return (
            <React.Fragment>
                {relatedIndicators.length > 0 && (
                    <Box>{relatedIndicators}</Box>
                )}
                <Box p="xs">
                    <MisskeyNote note={note} />
                    <MisskeyNoteActions note={note} />
                    <Divider mt="xs" />
                </Box>
            </React.Fragment>
        );
    }, [notes, lastSwitchToAutoUpdateTime, skippedNotesGroups, loadSkippedNotes, getNote]);

    // ヘッダーとしてスキップされたノートのインジケーターをレンダリング
    const renderHeader = useCallback(() => {
        // トップに表示するスキップされたノート
        const topIndicators = skippedNotesGroups
            .filter(group => group.referenceNoteId === 'timeline-top')
            .map((group) => {
                const groupIndex = skippedNotesGroups.findIndex(g =>
                    g.timestamp === group.timestamp && g.referenceNoteId === group.referenceNoteId);

                return (
                    <Box key={`skipped-top-${group.timestamp.getTime()}`}>
                        <SkippedNotesIndicator
                            count={group.count}
                            timestamp={group.timestamp}
                            groupIndex={groupIndex}
                            loadSkippedNotes={(groupIdx) => loadSkippedNotes(groupIdx, getNote)}
                            loadedNotes={group.loadedNotes}
                            isLoading={group.isLoading}
                        />
                    </Box>
                );
            });

        if (topIndicators.length === 0) return null;
        return <Box>{topIndicators}</Box>;
    }, [skippedNotesGroups, loadSkippedNotes, getNote]);

    // フッターとして読み込み中インジケーターをレンダリング
    const renderFooter = useCallback(() => {
        if (!isLoadingMore) return null;
        return (
            <Box py="md" ta="center">
                <Loader size="sm" />
                <Text size="xs" c="dimmed" mt="xs">読み込み中...</Text>
            </Box>
        );
    }, [isLoadingMore]);

    // 新しいデータをロードするコールバック
    const loadMoreData = useCallback(async () => {
        const now = Date.now();
        // 前回のロードからの一定時間経過していない場合はロードをスキップ
        const THROTTLE_TIMEOUT = 1000; // 1秒間のスロットリング
        if (isLoadingMore || (now - lastLoadTimeRef.current < THROTTLE_TIMEOUT)) {
            return;
        }

        // ロード状態を更新
        setIsLoadingMore(true);
        lastLoadTimeRef.current = now;
        
        try {
            // ロード関数をラップする
            await loadMoreNotes();
        } catch (error) {
            console.error('Error loading more notes:', error);
        } finally {
            // ロード完了後に状態をリセット（少し遅延させる）
            setTimeout(() => {
                setIsLoadingMore(false);
            }, 300); // 短い遅延でローディング表示の点滅を防止
        }
    }, [isLoadingMore, loadMoreNotes]);

    // virtuosoのスクロールリファレンス
    const virtuosoRef = useRef(null);


    // API読み込み中の表示
    if (isLoading && notes.length === 0) {
        return (
            <Box py="xl" ta="center">
                <Loader size="md" />
                <Text mt="md">タイムラインを読み込み中...</Text>
            </Box>
        );
    }

    // APIエラーの表示
    if (hasError && notes.length === 0) {
        return (
            <Box py="xl" ta="center">
                <Text c="red">{errorMessage}</Text>
                <Button
                    onClick={() => loadMoreNotes()}
                    mt="md"
                    variant="outline"
                >
                    再試行
                </Button>
            </Box>
        );
    }

    // スクロールトップ処理
    const handleScrollToTop = () => {
        if (virtuosoRef.current) {
            // @ts-expect-error Virtuosoのrefは複雑な型を持つため
            virtuosoRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <Box pos="relative" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {notes.length > 0 ? (
                <Virtuoso
                    ref={virtuosoRef}
                    style={{ height: 'calc(100vh - 100px)', width: '100%' }}
                    totalCount={notes.length}
                    itemContent={renderItem}
                    components={{
                        Header: renderHeader,
                        Footer: renderFooter,
                    }}
                    endReached={loadMoreData}
                    overscan={200}
                    increaseViewportBy={{ top: 300, bottom: 300 }}
                    initialTopMostItemIndex={0}
                    atTopStateChange={(atTop) => {
                        // atTopがtrueの場合は先頭にいる
                        if (atTop && !autoUpdateEnabled) {
                            setAutoUpdateEnabled(true);
                        } else if (!atTop && autoUpdateEnabled) {
                            setAutoUpdateEnabled(false);
                        }
                    }}
                />
            ) : (
                <Box py="md" ta="center">
                    <Text>ノートが読み込まれていません（デバッグ表示）</Text>
                    <Text size="xs" c="dimmed" mt="xs">notes.length: {notes.length}</Text>
                </Box>
            )}

            {buttonRightOffset !== null && (
                <React.Fragment>
                    <Box
                        style={{
                            position: 'fixed',
                            bottom: 94,
                            right: buttonRightOffset,
                            zIndex: 1000,
                        }}
                    >
                        <Transition mounted={showScrollToTop} transition="slide-up" duration={200} timingFunction="ease">
                            {(styles) => (
                                <Button
                                    leftSection={<IconArrowUp size={16} />}
                                    style={styles}
                                    onClick={handleScrollToTop}
                                    variant="filled"
                                >
                                    上へ戻る
                                </Button>
                            )}
                        </Transition>
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
});

export default MisskeyTimeline;