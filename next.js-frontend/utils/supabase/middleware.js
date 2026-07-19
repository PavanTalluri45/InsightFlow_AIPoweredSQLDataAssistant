import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";


const PROTECTED_PATHS = ["/history", "/pinned"];

export async function middleware(request) {
    const { supabase, response } = createClient(request);

    // Triggers a session refresh if the access token is stale.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isProtected = PROTECTED_PATHS.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !user) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};