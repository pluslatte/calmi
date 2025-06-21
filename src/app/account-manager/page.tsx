'use client';
import { Button, Container, Group, Title } from "@mantine/core";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import RegisteredAccountList from "../components/RegisteredAccountList";
import AuthenticationRequired from "../components/AuthenticationRequired";

const AccountManager = () => {
    const { status } = useSession();

    return (
        <AuthenticationRequired
            status={status}
        >
            <Container size="md" py="xl">
                <Group justify="space-between" mb="xl">
                    <Title order={1}>アカウントマネージャ</Title>
                    <Button
                        color="red"
                        onClick={() => signOut({ redirectTo: "/" })}
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