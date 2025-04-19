// src/components/MisskeyTimeline.tsx
'use client';

import React, { memo, useEffect, useRef } from 'react';
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Button, Divider, Loader, Text, Transition } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowUp, IconRefreshOff } from "@tabler/icons-react";
import SkippedNotesIndicator from "./SkippedNotesIndicator";
import TrimmedNotesIndicator from "./TrimmedNotesIndicator";
import { useTimelineStore, TimelineType } from '@/stores/timeline/useTimelineStore';
import { useMisskeyApiStore } from "@/stores/useMisskeyApiStore";
import { useTimelineUiStore } from "@/stores/timeline/useTimelineUiStore";

const MisskeyTimeline = memo(function MisskeyTimeline({
    timelineType,
    scrollAreaRef,
    containerRef
}: {
    timelineType: TimelineType;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
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
        trimmedNotesGroup,
        lastSwitchToAutoUpdateTime,
        initializeTimeline,
        cleanupTimeline,
        loadMoreNotes,
        setAutoUpdateEnabled,
        loadSkippedNotes,
        loadTrimmedNotes,
        getInfiniteScrollProps,
    } = useTimelineStore();
    const {
        showScrollToTop,
        buttonRightOffset,
        initializeTimelineUi,
        scrollToTop,
        updateScrollPosition,
        updateButtonOffset,
    } = useTimelineUiStore();

    const lastBoundaryIndexRef = useRef<number | null>(null);
    const prevTimelineTypeRef = useRef<TimelineType>(timelineType);

    // タイムラインタイプに応じた取得関数を返す
    const getTimelineFunction = () => {
        switch (timelineType) {
            case 'home': return getHomeTimeline;
            case 'social': return getHybridTimeline;
            case 'local': return getLocalTimeline;
            case 'global': return getGlobalTimeline;
        }
    };

    const { isLoadingMore, infiniteScrollRef } = getInfiniteScrollProps(getTimelineFunction());

    // 初期化処理
    useEffect(() => {
        if (!client) return;

        // タイムラインを初期化（initializeTimelineは内部でローカルストレージから
        // 保存されたタイムラインタイプを読み込む）
        initializeTimeline(client, timelineType);
        initializeTimelineUi();

        // タイムラインタイプが変更された場合
        if (prevTimelineTypeRef.current !== timelineType) {
            prevTimelineTypeRef.current = timelineType;

            // スクロール位置をトップに戻す
            if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTo({ top: 0 });
            }

            // 境界インデックスをリセット
            lastBoundaryIndexRef.current = null;
        }

        // 初期データのロード
        loadMoreNotes(getTimelineFunction());

        // クリーンアップ
        return () => {
            cleanupTimeline();
        };
    }, [client, timelineType, initializeTimeline, loadMoreNotes, cleanupTimeline]);

    // スクロール位置の監視を設定
    useEffect(() => {
        if (!scrollAreaRef.current) return;

        const handleScroll = () => {
            const scrollInfo = updateScrollPosition(scrollAreaRef);
            if (!scrollInfo) return;

            const nearTop = scrollInfo.nearTop;

            // スクロール位置に応じて自動更新の切り替え
            if (!nearTop && autoUpdateEnabled) {
                setAutoUpdateEnabled(false);
            } else if (nearTop && !autoUpdateEnabled) {
                setAutoUpdateEnabled(true);
            }
        };

        scrollAreaRef.current.addEventListener('scroll', handleScroll);
        return () => scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
    }, [scrollAreaRef, autoUpdateEnabled, setAutoUpdateEnabled, updateScrollPosition]);

    // ボタン表示位置の計算
    useEffect(() => {
        updateButtonOffset(containerRef);

        const handleResize = () => {
            updateButtonOffset(containerRef);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [containerRef, updateButtonOffset]);

    // 更新境界インデックスを探す
    const findUpdateBoundaryIndex = (): number | null => {
        if (!lastSwitchToAutoUpdateTime || notes.length === 0) return null;

        for (let i = 0; i < notes.length; i++) {
            const noteDate = new Date(notes[i].createdAt);
            if (noteDate < lastSwitchToAutoUpdateTime) {
                return i;
            }
        }

        return null;
    };

    // タイムラインの内容をレンダリング
    const renderItems = () => {
        // トップに表示するスキップされたノート
        const topIndicators = skippedNotesGroups
            .filter(group => group.referenceNoteId === 'timeline-top')
            .map((group, index) => {
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

        // 更新境界インデックスを計算
        const boundaryIndex = findUpdateBoundaryIndex();
        if (boundaryIndex !== null) {
            lastBoundaryIndexRef.current = boundaryIndex;
        }

        // 切り落とされたノートのインジケーター
        const trimmedIndicator = trimmedNotesGroup && trimmedNotesGroup.count > 0 ? (
            <Box key="trimmed-notes-indicator">
                <TrimmedNotesIndicator
                    count={trimmedNotesGroup.count}
                    timestamp={trimmedNotesGroup.timestamp}
                    loadTrimmedNotes={() => loadTrimmedNotes(getNote)}
                    loadedNotes={trimmedNotesGroup.loadedNotes}
                    isLoading={trimmedNotesGroup.isLoading}
                />
            </Box>
        ) : null;

        // 各ノートと関連するインジケーターをレンダリング
        let notesWithIndicators = notes.map((note, index) => {
            const showBoundary = lastBoundaryIndexRef.current === index && lastSwitchToAutoUpdateTime;

            const boundary = showBoundary ? (
                <React.Fragment key={`boundary-container-${lastSwitchToAutoUpdateTime?.getTime()}`}>
                    {/* これ厄介なのでいったん保留で issue #1 */}
                    {/* <TimelineUpdateBoundary
                        key={`boundary-${lastSwitchToAutoUpdateTime.getTime()}`}
                        timestamp={lastSwitchToAutoUpdateTime}
                    /> */}
                    {trimmedIndicator}
                </React.Fragment>
            ) : null;

            const relatedGroups = skippedNotesGroups
                .filter(group => group.referenceNoteId === note.id);

            const relatedIndicators = relatedGroups
                .map(group => {
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
                <React.Fragment key={note.id}>
                    {boundary}
                    {relatedIndicators}
                    <Box p="xs">
                        <MisskeyNote note={note} />
                        <MisskeyNoteActions />
                        <Divider mt="xs" />
                    </Box>
                </React.Fragment>
            );
        });

        return [...topIndicators, ...notesWithIndicators];
    };

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
                    onClick={() => loadMoreNotes(getTimelineFunction())}
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
        scrollToTop(scrollAreaRef);
    };

    return (
        <Box pos="relative">
            {renderItems()}
            <div ref={infiniteScrollRef} style={{ height: 1 }} />
            {isLoadingMore && (
                <Box py="md" ta="center">
                    <Loader size="sm" />
                    <Text size="xs" c="dimmed" mt="xs">読み込み中...</Text>
                </Box>
            )}

            {buttonRightOffset !== null && (
                <React.Fragment>
                    <Box
                        style={{
                            position: 'fixed',
                            bottom: 24,
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
                    <Box
                        c="dimmed"
                        style={{
                            position: 'fixed',
                            top: 73,
                            right: buttonRightOffset,
                            zIndex: 1000,
                        }}
                    >
                        <Transition mounted={!autoUpdateEnabled} transition="slide-up" duration={200} timingFunction="ease">
                            {(styles) => (
                                <IconRefreshOff
                                    size={16}
                                    style={styles}
                                />
                            )}
                        </Transition>
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
});

export default MisskeyTimeline;