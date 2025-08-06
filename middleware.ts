import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export const middleware = async (req: NextRequest) => {
    const session = await auth();

    if (req.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.json({}, { status: 401 });
    }

    return NextResponse.next();
};