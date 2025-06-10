'use client';
import { signOut } from "@/../auth";
import { Button, Container, Group, Loader, Title, Text } from "@mantine/core";
import React, { ReactNode } from "react";
import { useSession } from "next-auth/react";
import useAccounts from "@/hooks/useAccounts";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import RegisteredAccountList from "../components/RegisteredAccountList";

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
                </Group>
            </Container>
        );
    }

    return (<>{children}</>)
}

const AccountManager = () => {
    const { data: session, status } = useSession();

    const {
        accounts,
        activeAccountId,
        loadingAccounts,
        setAccounts,
        setActiveAccountId,
        setLoadingAccounts,
    } = useAccounts();

    return (
        <AuthenticationRequired
            status={status}
        >
            <Container size="md" py="xl">
                <Group justify="space-between" mb="xl">
                    <Title order={1}>ダッシュボード</Title>
                    <Button
                        color="red"
                        onClick={() => signOut()}
                    >
                        サインアウト
                    </Button>
                </Group>

                <RegisteredAccountList
                    accounts={accounts}
                    activeAccountId={activeAccountId}
                    loading={loadingAccounts}
                    setAccounts={setAccounts}
                    setActiveAccountId={setActiveAccountId}
                    setLoadingAccounts={setLoadingAccounts}
                />

                <NewAccountRegistrationForm
                    setAccounts={setAccounts}
                    setActiveAccountId={setActiveAccountId}
                    setLoading={setLoadingAccounts}
                />
            </Container>
        </AuthenticationRequired>
    );
}
export default AccountManager;