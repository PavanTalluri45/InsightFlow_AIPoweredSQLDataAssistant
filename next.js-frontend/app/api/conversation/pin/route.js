import { createClient } from "@/utils/supabase/server";
import { ConversationService } from "@/services/conversation.service";

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, is_pinned } = await request.json();

        if (!id || is_pinned === undefined) {
            return Response.json({ error: "id and is_pinned are required" }, { status: 400 });
        }

        const updated = await ConversationService.update(supabase, id, user.id, { is_pinned });
        return Response.json(updated);
    } catch (err) {
        console.error("Error in pin conversation API route:", err);
        return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
