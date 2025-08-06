"use client";
import { Button, Container, Group, Title } from "@mantine/core";
import React from "react";
import { signOut } from "next-auth/react";
import NewAccountRegistrationForm from "../components/NewAccountRegistrationForm";
import RegisteredAccountList from "../components/RegisteredAccountList";

const AccountManager = () => {
    return (
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
    );
}
export default AccountManager;