import { MisskeyAccountPublic } from "@/hooks/useAccounts";
import { Card, Title, Stack, TextInput, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export interface RegisterAccountResponse {
    success: true;
    account: MisskeyAccountPublic;
}

export interface ErrorResponse {
    error: string;
}

const handleRegisterImpl = async (
    e: React.FormEvent,
    instanceUrl: string,
    accessToken: string,
    onAccountRegistered: () => void,
    setSubmitting: (isSubmitting: boolean) => void,
    setInstanceUrl: (instanceUrl: string) => void,
    setAccessToken: (token: string) => void,
) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        const result = await registerAccount(
            instanceUrl,
            accessToken,
        );
        notifications.show({
            title: '成功',
            message: `${result.account.displayName}のアカウントが登録されました`,
            color: 'green',
        });
        setInstanceUrl('');
        setAccessToken('');
        onAccountRegistered(); // コールバック関数を呼び出し
    } catch (error) {
        console.error('Failed to register account:', error);
        notifications.show({
            title: 'エラー',
            message: `登録に失敗しました: ${error}`,
            color: 'red',
        });
    }
    setSubmitting(false);
}

const registerAccount = async (
    instanceUrl: string,
    accessToken: string,
): Promise<RegisterAccountResponse> => {
    const response = await fetch('/api/misskey-accounts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instanceUrl: instanceUrl.replace(/\/$/, ''), // 末尾のスラッシュを除去
            accessToken,
        }),
    });

    if (response.ok) {
        return await response.json();
    } else {
        const errorData: ErrorResponse = await response.json();
        throw Error(errorData.error);
    }
}

interface Props {
    onAccountRegistered: () => void;
}

const NewAccountRegistrationForm = ({
    onAccountRegistered,
}: Props
) => {
    const [instanceUrl, setInstanceUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        handleRegisterImpl(
            e,
            instanceUrl,
            accessToken,
            onAccountRegistered,
            setSubmitting,
            setInstanceUrl,
            setAccessToken
        );
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">新規アカウント登録</Title>
            <form onSubmit={handleRegister}>
                <Stack gap="md">
                    <TextInput
                        label="インスタンスURL"
                        placeholder="https://misskey.io"
                        value={instanceUrl}
                        onChange={(e) => setInstanceUrl(e.target.value)}
                        required
                    />
                    <TextInput
                        label="アクセストークン"
                        placeholder="APIキーを入力してください"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        type="password"
                        required
                    />
                    <Button
                        type="submit"
                        loading={submitting}
                        disabled={!instanceUrl || !accessToken}
                    >
                        登録
                    </Button>
                </Stack>
            </form>
        </Card>
    )
}

export default NewAccountRegistrationForm;