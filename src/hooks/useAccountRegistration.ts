import { useState } from "react";
import { registerAccountApi } from "@/lib/api/accounts";
import { notifyFailure, notifySuccess } from "@/lib/notifications";

const useAccountRegistration = (onSuccess?: () => void) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const registerAccount = async (
        instanceUrl: string,
        accessToken: string,
    ) => {
        setIsSubmitting(true);
        try {
            const result = await registerAccountApi(instanceUrl, accessToken);
            notifySuccess(`${result.account.displayName}のアカウントが登録されました`);
            onSuccess?.();
        } catch (error) {
            notifyFailure(error);
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