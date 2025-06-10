import { useState } from "react";
import { MisskeyAccountPublic } from "./useAccounts";
import { notifications } from "@mantine/notifications";

export interface RegisterAccountResponse {
    success: true;
    account: MisskeyAccountPublic;
}

export interface ErrorResponse {
    error: string;
}

const useAccountRegistration = (onSuccess?: () => void) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const registerAccount = async (
        instanceUrl: string,
        accessToken: string,
    ) => {
        setIsSubmitting(true);
        try {
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

            if (!response.ok) {
                const errorData: ErrorResponse = await response.json();
                throw new Error(errorData.error);
            }

            const result: RegisterAccountResponse = await response.json();

            notifications.show({
                title: '成功',
                message: `${result.account.displayName}のアカウントが登録されました`,
                color: 'green',
            });

            onSuccess?.();
        } catch (error) {
            notifications.show({
                title: 'エラー',
                message: `登録に失敗しました: ${error}`,
                color: 'red',
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        registerAccount,
        isSubmitting,
    }
}


export default useAccountRegistration;