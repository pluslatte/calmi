import { Prisma } from "@prisma/client";

export type MisskeyAccountPublic = Prisma.MisskeyAccountGetPayload<{
    select: {
        id: true;
        instanceUrl: true;
        username: true;
        displayName: true;
        avatarUrl: true;
        createdAt: true;
    }
}>;
