import { registerAccountApi } from "@/lib/misskey-api/accounts";
import { notifySuccess } from "@/lib/notifications";
import { Card, Title, Stack, TextInput, Button, Blockquote } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const NewAccountRegistrationForm = () => {
    const queryClient = useQueryClient();

    const [instanceUrl, setInstanceUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const registerMutation = useMutation({
        mutationFn: registerAccountApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registered-accounts'] });
            notifySuccess("アカウントを追加しました");
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate({ instanceUrl, accessToken });
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
                        placeholder="https://virtualkemomimi.net"
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
                        loading={registerMutation.isPending}
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