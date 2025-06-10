import { useState } from "react";
import { MisskeyAccountPublic } from "./useAccounts";
import { notifications } from "@mantine/notifications";
import { registerAccountApi } from "@/lib/api/accounts";

const useAccountRegistration = (onSuccess?: () => void) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const registerAccount = async (
        instanceUrl: string,
        accessToken: string,
    ) => {
        setIsSubmitting(true);
        try {
            const result = await registerAccountApi(instanceUrl, accessToken);

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