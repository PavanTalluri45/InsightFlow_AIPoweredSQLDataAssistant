import { createClient } from "@/utils/supabase/server";
import { ConversationService } from "@/services/conversation.service";

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversation = await ConversationService.create(supabase, user.id);
        return Response.json(conversation);
    } catch (err) {
        console.error("Error in create conversation API route:", err);
        return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
