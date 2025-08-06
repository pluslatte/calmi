"use client";
import { Button, Container, Group, Title } from "@mantine/core";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import RegisteredAccountList from "../components/RegisteredAccountList";
import AuthenticationRequired from "../components/AuthenticationRequired";

const AccountManager = () => {
    const session = useSession();
    return (
        <AuthenticationRequired
            status={session.status}
        >
            <Container size="md" py="xl">
                <Group justify="space-between" mb="xl">
                    <Title order={1}>アカウントマネージャ</Title>
                    <Button
                        color="red"
                        onClick={() => signOut({ redirectTo: "/auth" })}
                    >
                        サインアウト
                    </Button>
                </Group>

                <RegisteredAccountList />

                <NewAccountRegistrationForm />
            </Container>
        </AuthenticationRequired>
    );
}
export default AccountManager;