import { Box, Flex, ScrollArea } from "@mantine/core";
import React, { memo, useCallback, useRef, useState } from "react";
import MisskeyTimeline from "@/components/MisskeyTimeline";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineType } from "@/lib/misskey/api/TimelineApi";


const MisskeyTimelineContainer = memo(function MisskeyTimelineContainer({
    containerRef
}: {
    containerRef: React.RefObject<HTMLDivElement | null>
}) {
    const [timelineType, setTimelineType] = useState<TimelineType>('home');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // タイムラインのリセット関数を格納するための参照
    const timelineResetRef = useRef<{
        disableBufferingAndFlush?: () => void,
        setAutoUpdateFeed?: (enable: boolean) => void
    }>({});

    // タイムラインタイプ変更時の処理
    const handleTimelineTypeChange = useCallback((type: TimelineType) => {
        // タイムラインタイプを変更
        setTimelineType(type);

        // スクロール位置をトップに戻す
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0;
        }

        // バッファリングを無効化してバッファをフラッシュ
        if (timelineResetRef.current.disableBufferingAndFlush) {
            timelineResetRef.current.disableBufferingAndFlush();
        }

        // 自動更新を有効化
        if (timelineResetRef.current.setAutoUpdateFeed) {
            timelineResetRef.current.setAutoUpdateFeed(true);
        }
    }, []);

    // MisskeyTimelineから関数を受け取るコールバック
    const handleTimelineFunctionsRegister = useCallback((
        disableBufferingAndFlush: () => void,
        setAutoUpdateFeed: (enable: boolean) => void
    ) => {
        timelineResetRef.current = {
            disableBufferingAndFlush,
            setAutoUpdateFeed
        };
    }, []);

    return (
        <Flex direction="column" h="100%">
            <TimelineHeader
                timelineType={timelineType}
                onChangeType={handleTimelineTypeChange}
            />
            <ScrollArea viewportRef={scrollAreaRef} flex={1} type="auto">
                <Box mr="sm">
                    <MisskeyTimeline
                        timelineType={timelineType}
                        scrollAreaRef={scrollAreaRef}
                        containerRef={containerRef}
                        onRegisterFunctions={handleTimelineFunctionsRegister}
                    />
                </Box>
            </ScrollArea>
        </Flex>
    )
});
export default MisskeyTimelineContainer;