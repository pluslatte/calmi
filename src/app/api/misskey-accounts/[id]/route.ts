import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const accountId = params.id;

    const account = await prisma.misskeyAccount.findFirst({
        where: {
            id: accountId,
            sessionUserId: session.user.id
        }
    }).catch((error: any) => {
        throw Error('Failed to fetch accounts:', error);
    });

    if (!account) {
        return NextResponse.json(
            { error: 'Account not found' },
            { status: 404 }
        );
    }

    const userSettings = await prisma.userSettings.findUnique({
        where: {
            sessionUserId: session.user.id
        }
    }).catch((error: any) => {
        throw Error('Failed to fetch existing user settings:', error);
    });

    if (userSettings?.activeAccountId === accountId) {
        const otherAccount = await prisma.misskeyAccount.findFirst({
            where: {
                sessionUserId: session.user.id,
                id: {
                    not: accountId
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }).catch((error: any) => {
            throw Error('Failed to fetch other misskey account:', error);
        });

        await prisma.userSettings.update({
            where: {
                sessionUserId: session.user.id
            },
            data: {
                activeAccountId: otherAccount?.id || null
            }
        }).catch((error: any) => {
            throw Error('Failed to update user setting:', error);
        });
    }

    await prisma.misskeyAccount.delete({
        where: {
            id: accountId
        }
    }).catch((error: any) => {
        throw Error('Failed to delete misskey account:', error);
    });

    return NextResponse.json({
        success: true,
        message: 'Account deleted successfully'
    });
}