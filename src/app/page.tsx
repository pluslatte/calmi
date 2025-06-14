import { Button } from "@mantine/core"
import { signIn } from "@/../auth";

export default function Top() {
    return (
        <form
            action={async () => {
                'use server';
                await signIn("github", { redirectTo: "/account-manager" });
            }}
        >
            <Button type="submit">Signin with GitHub</Button>
        </form>
    )
}