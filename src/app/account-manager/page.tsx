'use client';
import { Button, Container, Group, Loader, Text, Title } from "@mantine/core";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import RegisteredAccountList from "../components/RegisteredAccountList";
import AuthenticationRequired from "../components/AuthenticationRequired";
import { notifySuccess } from "@/lib/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAccountApi, fetchAccountsApi } from "@/lib/misskey-api/accounts";
import { queryKeys } from "../queryKeys";

const AccountManager = () => {
    const { status } = useSession();

    const queryClient = useQueryClient();
    const queryResult = useQuery({
        queryKey: queryKeys.api.misskeyAccounts(),
        queryFn: fetchAccountsApi,
    });
    const deleteMutation = useMutation({
        mutationFn: deleteAccountApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.api.misskeyAccounts() });
            notifySuccess("アカウントを削除しました");
        },
    });

    const handlerDelete = (accountId: string) => {
        deleteMutation.mutate(accountId)
    };

    if (queryResult.isPending) {
        return (
            <Container size="md" py="xl">
                <Group justify="center">
                    <Loader size="lg" />
                </Group>
            </Container>
        )
    }

    if (queryResult.isError) {
        return (
            <Container size="md" py="xl">
                <Group justify="center">
                    <Text size="lg">Error!</Text>
                </Group>
            </Container>
        )
    }

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
                    accounts={queryResult.data.accounts}
                    activeAccountId={queryResult.data.activeAccountId}
                    handlerDelete={handlerDelete}
                />

                <NewAccountRegistrationForm />
            </Container>
        </AuthenticationRequired>
    );
}
export default AccountManager;