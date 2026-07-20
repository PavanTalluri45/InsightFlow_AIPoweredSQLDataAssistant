/**
 * conversation-api.js
 *
 * Centralized API client layer. All components should import these functions
 * rather than calling fetch() directly.
 */

/**
 * Creates a new conversation.
 * @returns {Promise<Object>} The created conversation object
 */
export async function createConversation() {
    const response = await fetch("/api/conversation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create conversation");
    }
    return response.json();
}

/**
 * Fetches the list of all conversations for the authenticated user.
 * @returns {Promise<Array>} List of conversations
 */
export async function getConversations() {
    const response = await fetch("/api/conversation/history");

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch conversation history");
    }
    return response.json();
}

/**
 * Fetches all messages in a conversation.
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<Array>} List of messages
 */
export async function getConversationMessages(conversationId) {
    if (!conversationId) {
        throw new Error("conversationId is required");
    }

    const response = await fetch(`/api/conversation/messages?conversation_id=${conversationId}`);

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch conversation messages");
    }
    return response.json();
}

/**
 * Sends a chat message. Calling this triggers the FastAPI backend to
 * analyze the question and write to the conversation_messages table.
 * @param {string} conversationId - Conversation UUID
 * @param {string} question - Natural language user question
 * @returns {Promise<Object>} { message: Object, titleUpdated: string|null }
 */
export async function sendChatMessage(conversationId, question) {
    if (!conversationId || !question) {
        throw new Error("conversationId and question are required");
    }

    const response = await fetch("/api/conversation/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, question })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send chat message");
    }
    return response.json();
}

/**
 * Updates properties of a conversation (e.g. title or is_pinned).
 * @param {string} id - Conversation UUID
 * @param {Object} updates - Update payload
 * @returns {Promise<Object>} The updated conversation object
 */
export async function updateConversation(id, updates) {
    if (!id || !updates) {
        throw new Error("id and updates are required");
    }

    const response = await fetch("/api/conversation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update conversation");
    }
    return response.json();
}

/**
 * Pins a conversation.
 * @param {string} id - Conversation UUID
 * @returns {Promise<Object>} The updated conversation object
 */
export async function pinConversation(id) {
    if (!id) {
        throw new Error("id is required");
    }

    const response = await fetch("/api/conversation/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_pinned: true })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to pin conversation");
    }
    return response.json();
}

/**
 * Unpins a conversation.
 * @param {string} id - Conversation UUID
 * @returns {Promise<Object>} The updated conversation object
 */
export async function unpinConversation(id) {
    if (!id) {
        throw new Error("id is required");
    }

    const response = await fetch("/api/conversation/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_pinned: false })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to unpin conversation");
    }
    return response.json();
}

/**
 * Deletes a conversation.
 * @param {string} id - Conversation UUID
 * @returns {Promise<Object>} { success: true }
 */
export async function deleteConversation(id) {
    if (!id) {
        throw new Error("id is required");
    }

    const response = await fetch("/api/conversation/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete conversation");
    }
    return response.json();
}
