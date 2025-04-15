import { MisskeyService } from "@/services/MisskeyService";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect, useContext, createContext } from "react";

// src/contexts/MisskeyContext.tsx
interface MisskeyContextType {
    service: MisskeyService | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => void;
}

const defaultLogin = () => {
    const sessionId = crypto.randomUUID();
    const misskeyHost = 'https://virtualkemomimi.net';
    const appName = 'calmi';
    const callbackUrl = 'http://localhost:3000/callback';
    const permissions = 'read:account,write:notes,read:channels,read:notifications,write:reactions';

    const authUrl = `${misskeyHost}/miauth/${sessionId}?name=${appName}&callback=${callbackUrl}&permission=${permissions}`;
    window.location.href = authUrl;
};

const MisskeyContext = createContext<MisskeyContextType>({
    service: null,
    isAuthenticated: false,
    loading: true,
    login: async () => { },
    logout: () => { }
});

export function MisskeyProvider({ children }: { children: React.ReactNode }) {
    const [service, setService] = useState<MisskeyService | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // ページロード時に認証状態をチェック
        const token = localStorage.getItem('misskey_token');
        if (token) {
            const newService = new MisskeyService({
                origin: 'https://virtualkemomimi.net',
                token
            });
            setService(newService);
        } else {
            redirect('/login');
        }
        setLoading(false);
    }, []);

    const login = async () => {
        setLoading(true);
        const sessionId = crypto.randomUUID();
        const misskeyHost = 'https://virtualkemomimi.net';
        const appName = 'calmi';
        const callbackUrl = 'http://localhost:3000/callback';
        const permissions = 'read:account,write:notes,read:channels,read:notifications,write:reactions';

        const authUrl = `${misskeyHost}/miauth/${sessionId}?name=${appName}&callback=${callbackUrl}&permission=${permissions}`;
        window.location.href = authUrl;
    };

    const logout = () => {
        localStorage.removeItem('misskey_token');
        setService(null);
        router.push('/login');
    };

    return (
        <MisskeyContext.Provider
            value={{
                service,
                isAuthenticated: !!service,
                loading,
                login,
                logout
            }}
        >
            {children}
        </MisskeyContext.Provider>
    );
}

export const useMisskeyService = () => {
    const context = useContext(MisskeyContext);
    return context;
};