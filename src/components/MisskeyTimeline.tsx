'use client';

import React, { memo, useEffect } from 'react';
import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import MisskeyNote from "@/components/MisskeyNote";
import { Box, Button, Divider, Grid, Text, Transition } from "@mantine/core";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";
import { IconArrowUp } from "@tabler/icons-react";
import { useTimelineFeed } from "@/hooks/useTimelineFeed";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import SkippedNotesIndicator from "./SkippedNotesIndicator";
import TrimmedNotesIndicator from "./TrimmedNotesIndicator";

export type TimelineType = 'home' | 'social' | 'local' | 'global';

const MisskeyTimeline = memo(function MisskeyTimeline({ timelineType, scrollAreaRef, containerRef }: {
    timelineType: TimelineType;
    scrollAreaRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const misskeyApiClient = useMisskeyApiClient();

    const {
        notes,
        loadMore,
        setAutoUpdateFeed,
        timelineAutoUpdateState,
        skippedNotesGroups,
        loadSkippedNotes,
        loadingSkippedNotes,
        trimmedNotesGroup,
        loadTrimmedNotes,
        loadingTrimmedNotes,
    } = useTimelineFeed(timelineType, misskeyApiClient);

    const { sentinelRef } = useInfiniteScroll(loadMore);

    const {
        showScrollToTop,
        buttonRightOffset,
        handleScrollToTop
    } = useScrollToTop(scrollAreaRef, containerRef);

    useEffect(() => {
        if (!scrollAreaRef.current) return;

        const handleScroll = () => {
            const scrollEl = scrollAreaRef.current;
            if (!scrollEl) return;

            const top = scrollEl.scrollTop;
            const nearTop = top < 200;

            if (!nearTop && notes.length > 0) {
                setAutoUpdateFeed(false);
            } else if (nearTop) {
                setAutoUpdateFeed(true);
            }
        };

        scrollAreaRef.current.addEventListener('scroll', handleScroll);
        return () => scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
    }, [scrollAreaRef, notes.length, setAutoUpdateFeed]);

    const renderItems = () => {
        // 切り落とされたノートのインジケーターを表示（タイムライン上部に配置）
        const trimmedIndicator = trimmedNotesGroup && trimmedNotesGroup.count > 0 ? (
            <Box key="trimmed-notes-indicator">
                <TrimmedNotesIndicator
                    count={trimmedNotesGroup.count}
                    timestamp={trimmedNotesGroup.timestamp}
                    loadTrimmedNotes={loadTrimmedNotes}
                    loadedNotes={trimmedNotesGroup.loadedNotes}
                    isLoading={loadingTrimmedNotes}
                />
            </Box>
        ) : null;


        // スキップされたノートのグループがタイムライン先頭にある場合専用（出番は少ないと思うが一応）
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
                            loadSkippedNotes={loadSkippedNotes}
                            loadedNotes={group.loadedNotes}
                            isLoading={group.isLoading}
                        />
                    </Box>
                )

            })

        // 各ノートに関連しているスキップされたノートのグループを配置する
        let notesWithIndicators = notes.map((note, index) => {
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
                                loadSkippedNotes={loadSkippedNotes}
                                loadedNotes={group.loadedNotes}
                                isLoading={group.isLoading}
                            />
                        </Box>
                    );
                });

            return (
                <React.Fragment key={note.id}>
                    {relatedIndicators}
                    <Box>
                        <MisskeyNote note={note} />
                        <MisskeyNoteActions />
                        <Divider my="sm" />
                    </Box>
                </React.Fragment>
            )
        });

        return [trimmedIndicator, ...topIndicators, ...notesWithIndicators];
    }

    return (
        <Box pos="relative">
            {renderItems()}
            <div ref={sentinelRef} style={{ height: 1 }} />

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
                        style={{
                            position: 'fixed',
                            top: 24,
                            right: buttonRightOffset,
                            zIndex: 1000,
                        }}
                    >
                        <Transition mounted={!timelineAutoUpdateState} transition="slide-up" duration={200} timingFunction="ease">
                            {(styles) => (
                                <Text
                                    style={styles}
                                >
                                    {`自動更新オフ`}
                                </Text>
                            )}
                        </Transition>
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
});
export default MisskeyTimeline;
