import { Loader } from "@mantine/core";
import { ReactNode } from "react";

interface PropsLoadHider {
    loading: boolean;
    children: ReactNode;
}
const LoadHider = ({ loading, children }: PropsLoadHider) => {
    if (loading) {
        return (
            <Loader size="lg" />
        )
    }
    return (
        <>{children}</>
    )
}

export default LoadHider;