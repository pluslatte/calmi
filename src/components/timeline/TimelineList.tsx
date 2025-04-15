import { Box, Divider, Loader } from "@mantine/core";
import { Note } from "misskey-js/entities.js";
import { useEffect, useRef } from "react";
import MisskeyNote from "@/components/MisskeyNote";
import MisskeyNoteActions from "@/components/MisskeyNoteActions";

export function TimelineList({
    notes,
    onLoadMore,
    isLoading = false
}: {
    notes: Note[];
    onLoadMore: () => void;
    isLoading?: boolean;
}) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    // 無限スクロールの設定
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                    onLoadMore();
                }
            },
            { rootMargin: '100px' }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [onLoadMore, isLoading]);

    if (notes.length === 0 && isLoading) {
        return <Loader mt="xl" mx="auto" />;
    }

    return (
        <>
            {notes.map(note => (
                <Box key={note.id}>
                    <MisskeyNote note={note} />
                    <MisskeyNoteActions />
                    <Divider my="sm" />
                </Box>
            ))}
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isLoading && <Loader mt="md" mx="auto" size="sm" />}
        </>
    );
}