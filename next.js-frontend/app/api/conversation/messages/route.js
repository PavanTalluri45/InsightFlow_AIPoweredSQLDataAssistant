import { createClient } from "@/utils/supabase/server";
import { ConversationService } from "@/services/conversation.service";

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversation_id");

        if (!conversationId) {
            return Response.json({ error: "conversation_id is required" }, { status: 400 });
        }

        const messages = await ConversationService.getMessages(supabase, conversationId, user.id);
        return Response.json(messages);
    } catch (err) {
        console.error("Error in GET conversation messages API route:", err);
        return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversation_id, question } = await request.json();

        if (!conversation_id || !question) {
            return Response.json({ error: "conversation_id and question are required" }, { status: 400 });
        }

        // 1. Call FastAPI endpoint
        console.log(`Calling FastAPI backend for question: "${question}"`);
        const apiResponse = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });

        if (!apiResponse.ok) {
            const errData = await apiResponse.json().catch(() => ({}));
            const errMsg = errData.detail || "FastAPI backend failed to respond";
            return Response.json({ error: errMsg }, { status: apiResponse.status });
        }

        const responseData = await apiResponse.json();

        if (!responseData.success) {
            return Response.json({ error: responseData.error || "FastAPI returned success: false" }, { status: 400 });
        }

        // 2. Insert message row into Supabase and update conversation (title + updated_at)
        const result = await ConversationService.addMessage(
            supabase,
            conversation_id,
            user.id,
            {
                question: responseData.question,
                answer: responseData.answer,
                data: responseData.data,
                visualization: responseData.visualization,
                execution_time: responseData.execution_time,
                row_count: responseData.row_count
            }
        );

        return Response.json({
            message: result.message,
            titleUpdated: result.titleUpdated
        });
    } catch (err) {
        console.error("Error in POST conversation message API route:", err);
        return Response.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
