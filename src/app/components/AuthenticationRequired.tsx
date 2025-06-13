import { Button, Container, Group, Loader, Text } from "@mantine/core";
import Link from "next/link";
import { ReactNode } from "react";

interface PropsAuthenticationRequired {
    status: 'loading' | 'authenticated' | 'unauthenticated';
    children: ReactNode;
}
const AuthenticationRequired = ({ status, children }: PropsAuthenticationRequired) => {

    if (status === 'loading') {
        return (
            <Container size="md" py="xl">
                <Group justify="center">
                    <Loader size="lg" />
                    <Text>Checking authentication...</Text>
                </Group>
            </Container>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <Container size="md" py="xl">
                <Group justify="center">
                    <Text>Access  Denied</Text>
                    <Button component={Link} href="/" variant="filled">
                        ホームに戻る
                    </Button>
                </Group>
            </Container>
        );
    }

    return (<>{children}</>)
}

export default AuthenticationRequired;