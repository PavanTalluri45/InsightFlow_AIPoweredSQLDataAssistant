export class ConversationService {
    /**
     * Create a new conversation row for the user.
     * @param {Object} supabase - Supabase server client
     * @param {string} userId - Auth user UUID
     * @returns {Promise<Object>} The created conversation object
     */
    static async create(supabase, userId) {
        const { data, error } = await supabase
            .from("conversations")
            .insert({
                user_id: userId,
                title: "New Chat",
                is_pinned: false
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating conversation in service:", error);
            throw error;
        }
        return data;
    }

    /**
     * Fetch all *active* conversations for the authenticated user, ordered by updated_at DESC.
     * Soft-deleted conversations (status = 'inactive') are excluded.
     * @param {Object} supabase - Supabase server client
     * @param {string} userId - Auth user UUID
     * @returns {Promise<Array>} List of conversation records
     */
    static async getHistory(supabase, userId) {
        const { data, error } = await supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error fetching conversation history:", error);
            throw error;
        }
        return data || [];
    }

    /**
     * Fetch all messages for a single conversation after verifying ownership.
     * Only readable while the conversation is active — this mirrors the
     * conversation_messages RLS policies, which also require status = 'active'.
     * @param {Object} supabase - Supabase server client
     * @param {string} conversationId - Conversation UUID
     * @param {string} userId - Auth user UUID
     * @returns {Promise<Array>} List of message records for the conversation
     */
    static async getMessages(supabase, conversationId, userId) {
        // First verify ownership of the conversation
        const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("id")
            .eq("id", conversationId)
            .eq("user_id", userId)
            .eq("status", "active")
            .single();

        if (convError || !conversation) {
            throw new Error("Conversation not found or unauthorized access");
        }

        const { data, error } = await supabase
            .from("conversation_messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching conversation messages:", error);
            throw error;
        }
        return data || [];
    }

    /**
     * Add a message to a conversation. If the conversation's current title is "New Chat",
     * automatically update the title to the question trimmed to approximately 50 characters.
     * Also updates conversations.updated_at timestamp.
     * @param {Object} supabase - Supabase server client
     * @param {string} conversationId - Conversation UUID
     * @param {string} userId - Auth user UUID
     * @param {Object} messageData - Object containing question, answer, data, visualization, etc.
     * @returns {Promise<Object>} The newly created message and title update information
     */
    static async addMessage(supabase, conversationId, userId, messageData) {
        // Verify ownership and fetch current title. A soft-deleted (inactive)
        // conversation should not accept new messages.
        const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("title")
            .eq("id", conversationId)
            .eq("user_id", userId)
            .eq("status", "active")
            .single();

        if (convError || !conversation) {
            throw new Error("Conversation not found or unauthorized access");
        }

        // Insert the message
        const { data: message, error: msgError } = await supabase
            .from("conversation_messages")
            .insert({
                conversation_id: conversationId,
                question: messageData.question,
                answer: messageData.answer,
                data: messageData.data,
                visualization: messageData.visualization,
                execution_time: messageData.execution_time,
                row_count: messageData.row_count
            })
            .select()
            .single();

        if (msgError) {
            console.error("Error inserting message:", msgError);
            throw msgError;
        }

        // Prepare updates for conversations table
        const updates = {
            updated_at: new Date().toISOString()
        };

        // If the title is still the default "New Chat", update it using the first question
        if (conversation.title === "New Chat") {
            updates.title = messageData.question.trim();
        }

        // Perform the update
        const { error: updateError } = await supabase
            .from("conversations")
            .update(updates)
            .eq("id", conversationId);

        if (updateError) {
            console.error("Error updating conversation updated_at/title:", updateError);
            throw updateError;
        }

        return {
            message,
            titleUpdated: updates.title || null
        };
    }

    /**
     * Update a conversation's general fields (e.g. title or is_pinned).
     * @param {Object} supabase - Supabase server client
     * @param {string} id - Conversation UUID
     * @param {string} userId - Auth user UUID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} The updated conversation object
     */
    static async update(supabase, id, userId, updates) {
        const { data, error } = await supabase
            .from("conversations")
            .update(updates)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating conversation:", error);
            throw error;
        }
        return data;
    }

    /**
     * Soft-delete a conversation.
     *
     * The conversations table has no DELETE RLS policy (see sql schema note),
     * so a real .delete() call would be rejected. "Deleting" here means
     * flipping status to 'inactive': it drops out of getHistory() immediately,
     * and its messages become unreadable/unwritable per the RLS policies on
     * conversation_messages (which check c.status = 'active').
     * @param {Object} supabase - Supabase server client
     * @param {string} id - Conversation UUID
     * @param {string} userId - Auth user UUID
     * @returns {Promise<Object>} Success indicator and the updated row
     */
    static async delete(supabase, id, userId) {
        const { data, error } = await supabase
            .from("conversations")
            .update({ status: "inactive" })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error deleting conversation:", error);
            throw error;
        }
        return { success: true, conversation: data };
    }
}