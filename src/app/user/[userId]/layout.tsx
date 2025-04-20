'use client';

import { Box } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserHeader from "@/components/UserHeader";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        // ローカルストレージからトークンを取得して認証チェック
        const token = localStorage.getItem('misskey_token');
        if (!token) {
            // 未認証の場合はログインページへリダイレクト
            router.push('/login');
        }
    }, [router]);

    return (
        <>
            <UserHeader />
            <Box pt="md">
                {children}
            </Box>
        </>
    );
}