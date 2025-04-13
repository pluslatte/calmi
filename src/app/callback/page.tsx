'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Callback() {
    const router = useRouter();

    useEffect(() => {
        const session = new URLSearchParams(window.location.search).get('session');

        if (session) {
            const getAccessToken = async (sessionId: string): Promise<string> => {
                const res = await fetch(`https://virtualkemomimi.net/api/miauth/${sessionId}/check`, {
                    method: 'POST',
                });
                if (!res.ok) {
                    alert('authentication failed A');
                }

                const data: { token: string } = await res.json();

                return data.token;
            };

            getAccessToken(session).then((token) => {
                if (!token) {
                    alert('authentication failed B');
                    return;
                }
                localStorage.setItem('misskey_token', token);
                router.push('/dashboard');
            });
        } else {
            alert('authentication failed C');
        }
    })
}