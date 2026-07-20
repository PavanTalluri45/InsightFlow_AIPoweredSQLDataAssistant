import { createClient } from "@/utils/supabase/server";
import { ConversationService } from "@/services/conversation.service";

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return Response.json({ error: "id is required" }, { status: 400 });
        }

        const result = await ConversationService.delete(supabase, id, user.id);
        return Response.json(result);
    } catch (err) {
        console.error("Error in delete conversation API route:", err);
        return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
