import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import { Note } from "misskey-js/entities.js";

export default function MisskeyNote({ note }: { note: Note }) {
    const misskeyApiClient = useMisskeyApiClient();

    return (
        <p>{note.text}</p>
    );
}