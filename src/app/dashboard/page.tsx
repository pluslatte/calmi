import { auth, signOut } from "@/../auth";
import { Button } from "@mantine/core";

export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) {
        return (
            <div>
                <h1>Unauthorized</h1>
                <p>You are not authorized to view this page.</p>
                <a href="/">もどる</a>
            </div>
        );
    }

    console.log("Session User:", session.user);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard!</p>
            <p>This page is currently under construction.</p>
            <form
                action={async () => {
                    'use server';
                    await signOut();
                }}
            >
                <Button type="submit" color="red">Sign Out</Button>
            </form>
        </div>
    );
}