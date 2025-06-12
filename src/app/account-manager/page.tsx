'use client';
import { signOut } from "@/../auth";
import { Button, Container, Group, Title } from "@mantine/core";
import React from "react";
import { useSession } from "next-auth/react";
import useAccounts from "@/hooks/useAccounts";
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
    } = useAccounts(status);

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