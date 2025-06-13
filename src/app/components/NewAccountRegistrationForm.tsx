import useAccountRegistration from "@/hooks/useAccountRegistration";
import { notifyFailure, notifySuccess } from "@/lib/notifications";
import { Card, Title, Stack, TextInput, Button, Blockquote } from "@mantine/core";
import { useState } from "react";

interface Props {
    onAccountRegistered: () => void;
}

const NewAccountRegistrationForm = ({
    onAccountRegistered,
}: Props
) => {
    const [instanceUrl, setInstanceUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const { registerAccount, isSubmitting } = useAccountRegistration(() => {
        setInstanceUrl('');
        setAccessToken('');
        onAccountRegistered();
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await registerAccount(instanceUrl, accessToken);
            notifySuccess(`${result.account.displayName}のアカウントが登録されました`);
        } catch (error) {
            notifyFailure(error);
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">新規アカウント登録</Title>
            <Blockquote color="red" mb="lg">
                APIキーがサーバー上に保持されます！<br />
                あなたが何をしようとしているかを理解していますか？ホストは信頼できますか？<br />
                不明な場合は、アカウントを登録しないでください。
            </Blockquote>

            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="インスタンスURL"
                        placeholder="https://misskey.io"
                        value={instanceUrl}
                        onChange={(e) => setInstanceUrl(e.target.value)}
                        required
                    />
                    <TextInput
                        label="APIキー"
                        placeholder="APIキーを入力してください"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        type="password"
                        required
                    />
                    <Button
                        type="submit"
                        loading={isSubmitting}
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