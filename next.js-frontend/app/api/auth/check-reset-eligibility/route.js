import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request) {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });

    if (error) {
        return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
    }

    const user = data.users.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (!user) {
        return NextResponse.json({ status: "not_found" });
    }

    const providers = user.app_metadata?.providers ?? [];
    const hasPasswordProvider = providers.includes("email");

    if (!hasPasswordProvider) {
        return NextResponse.json({ status: "oauth_only" });
    }

    return NextResponse.json({ status: "ok" });
}