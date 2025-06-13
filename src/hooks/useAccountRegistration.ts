import { useState } from "react";
import { registerAccountApi, RegisterAccountApiResponse } from "@/lib/api/accounts";

const useAccountRegistration = (onSuccess?: () => void) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const registerAccount = async (
        instanceUrl: string,
        accessToken: string,
    ): Promise<RegisterAccountApiResponse> => {
        setIsSubmitting(true);

        const result = await registerAccountApi(instanceUrl, accessToken,);

        result && onSuccess?.();
        setIsSubmitting(false);
        return result;
    };

    return {
        registerAccount,
        isSubmitting,
    }
}


export default useAccountRegistration;