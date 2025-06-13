import { auth } from "@/../auth";
import { encryptToken } from "@/lib/crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const accounts = await prisma.misskeyAccount.findMany({
        where: {
            sessionUserId: session.user.id
        },
        select: {
            id: true,
            instanceUrl: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    }).catch((error: any) => {
        throw Error('Failed to fetch accounts:', error);
    })

    const userSettings = await prisma.userSettings.findUnique({
        where: {
            sessionUserId: session.user.id
        }
    }).catch((error: any) => {
        throw Error('Failed to fetch userSettings:', error);
    });

    return NextResponse.json({
        accounts,
        activeAccountId: userSettings?.activeAccountId || null
    });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const body = await request.json().catch((error: any) => {
        throw Error('Error request.json:', error);
    })

    const { instanceUrl, accessToken } = body;
    if (!instanceUrl || !accessToken) {
        return NextResponse.json(
            { error: 'instanceUrl and accessToken are required' },
            { status: 400 }
        );
    }

    const misskeyResponse = await fetch(`${instanceUrl}/api/i`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            i: accessToken
        })
    }).catch((error: any) => {
        throw Error('Failed to fetch misskey api:', error);
    })

    if (!misskeyResponse.ok) {
        return NextResponse.json(
            { error: 'Invalid access token or instance URL, or failed to fetch API' },
            { status: 400 }
        );
    }

    const userInfo = await misskeyResponse.json().catch((error: any) => {
        throw Error('Error misskeyResponse.json:', error)
    });

    const existingAccount = await prisma.misskeyAccount.findFirst({
        where: {
            sessionUserId: session.user.id,
            instanceUrl: instanceUrl,
            username: userInfo.username,
        }
    }).catch((error: any) => {
        throw Error('Failed to fetch existing accounts:', error);
    });

    if (existingAccount) {
        return NextResponse.json(
            { error: 'This account is already registered' },
            { status: 409 }
        );
    }

    const encryptedToken = encryptToken(accessToken);

    const newAccount = await prisma.misskeyAccount.create({
        data: {
            sessionUserId: session.user.id,
            instanceUrl: instanceUrl,
            accessToken: encryptedToken,
            username: userInfo.username,
            displayName: userInfo.name || userInfo.username,
            avatarUrl: userInfo.avatarUrl
        },
        select: {
            id: true,
            instanceUrl: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true
        }
    }).catch((error: any) => {
        throw Error('Failed to create new account:', error);
    });

    const userSettings = await prisma.userSettings.findUnique({
        where: {
            sessionUserId: session.user.id
        }
    }).catch((error: any) => {
        throw Error('Failed to fetch existing user settings:', error);
    })

    if (!userSettings) {
        await prisma.userSettings.create({
            data: {
                sessionUserId: session.user.id,
                activeAccountId: newAccount.id,
            }
        }).catch((error: any) => {
            throw Error('Failed to create new user setting:', error);
        })
    } else if (!userSettings.activeAccountId) {
        await prisma.userSettings.update({
            where: {
                sessionUserId: session.user.id
            },
            data: {
                activeAccountId: newAccount.id
            }
        }).catch((error: any) => {
            throw Error('Failed to update user setting:', error);
        })
    }

    return NextResponse.json({
        success: true,
        account: newAccount
    });
}