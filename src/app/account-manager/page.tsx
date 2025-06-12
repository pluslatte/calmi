'use client';
import { Button, Container, Group, Title } from "@mantine/core";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import useRegisteredAccountsList from "@/hooks/useRegisteredAccountsList";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import RegisteredAccountList from "../components/RegisteredAccountList";
import AuthenticationRequired from "../components/AuthenticationRequired";
import { notifyFailure } from "@/lib/notifications";

const AccountManager = () => {
    const { data: session, status } = useSession();

    const {
        accounts,
        activeAccountId,
        loadingAccounts,
        refreshAccounts,
    } = useRegisteredAccountsList(status);

    return (
        <AuthenticationRequired
            status={status}
        >
            <Container size="md" py="xl">
                <Group justify="space-between" mb="xl">
                    <Title order={1}>ダッシュボード</Title>
                    <Button
                        color="red"
                        onClick={() => signOut({ redirectTo: "/" })}
                    >
                        サインアウト
                    </Button>
                </Group>

                <RegisteredAccountList
                    accounts={accounts}
                    activeAccountId={activeAccountId}
                    loading={loadingAccounts}
                    onAccountDeleted={async () => {
                        await refreshAccounts().catch(notifyFailure);
                    }}
                />

                <NewAccountRegistrationForm
                    onAccountRegistered={async () => {
                        await refreshAccounts().catch(notifyFailure);
                    }}
                />
            </Container>
        </AuthenticationRequired>
    );
}
export default AccountManager;