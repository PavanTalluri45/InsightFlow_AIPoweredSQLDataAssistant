"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import {
    createConversation as apiCreateConversation,
    getConversations as apiGetConversations,
    getConversationMessages as apiGetConversationMessages,
    sendChatMessage as apiSendChatMessage,
    pinConversation as apiPinConversation,
    unpinConversation as apiUnpinConversation,
    deleteConversation as apiDeleteConversation
} from "@/lib/api/conversation-api"

const ConversationContext = createContext(null)

export function ConversationProvider({ children }) {
    const { user, loading: authLoading } = useAuth()
    // Derive a stable primitive from the user object. Supabase re-emits
    // onAuthStateChange (e.g. on tab focus / visibility change) with a
    // *new* user object even for the same signed-in user, which would
    // otherwise retrigger every effect/callback keyed on `user`.
    const userId = user?.id ?? null

    const [conversations, setConversations] = useState([])
    const [currentConversationId, setCurrentConversationId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isHistoryLoading, setIsHistoryLoading] = useState(false)
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)

    // Tracks whether we've successfully loaded the list at least once for
    // the current user, so background/duplicate refetches (tab refocus,
    // token refresh, etc.) update the list silently instead of flashing
    // the skeleton again.
    const hasLoadedConversationsRef = useRef(false)

    // Load conversation list when authenticated user changes
    const loadConversations = useCallback(async () => {
        if (!userId) return
        if (!hasLoadedConversationsRef.current) {
            setIsHistoryLoading(true)
        }
        try {
            const list = await apiGetConversations()
            setConversations(list)
        } catch (err) {
            console.error("Failed to load conversations:", err)
        } finally {
            hasLoadedConversationsRef.current = true
            setIsHistoryLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (userId && !authLoading) {
            loadConversations()
        } else if (!userId) {
            // Reset state on sign-out
            setConversations([])
            setCurrentConversationId(null)
            setMessages([])
            hasLoadedConversationsRef.current = false
        }
    }, [userId, authLoading, loadConversations])

    // Select a conversation and fetch its messages
    const selectConversation = useCallback(async (id) => {
        setCurrentConversationId(id)
        if (!id) {
            setMessages([])
            return
        }

        setIsMessagesLoading(true)
        try {
            const dbMessages = await apiGetConversationMessages(id)

            // Convert database rows into separate user/assistant chat messages
            const chatMessages = []
            dbMessages.forEach((msg) => {
                chatMessages.push({
                    id: `${msg.id}-user`,
                    role: "user",
                    content: msg.question,
                    timestamp: msg.created_at
                })
                if (msg.answer) {
                    chatMessages.push({
                        id: `${msg.id}-assistant`,
                        role: "assistant",
                        content: msg.answer,
                        timestamp: msg.created_at,
                        data: msg.data,
                        visualization: msg.visualization,
                        execution_time: msg.execution_time,
                        row_count: msg.row_count
                    })
                }
            })

            setMessages(chatMessages)
        } catch (err) {
            console.error("Failed to fetch conversation messages:", err)
            setMessages([])
        } finally {
            setIsMessagesLoading(false)
        }
    }, [])

    // Synchronously starts a new chat on the UI (no DB call)
    const startNewChat = useCallback(() => {
        setCurrentConversationId(null)
        setMessages([])
        setIsLoading(false)
        setIsMessagesLoading(false)
    }, [])

    // Send a message within the active conversation
    const sendMessage = useCallback(async (question) => {
        if (isLoading || !question.trim()) return

        const trimmedQuestion = question.trim()
        setIsLoading(true)

        // Optimistically add the user message
        const tempUserMsgId = `temp-${Date.now()}`
        const userMsg = {
            id: tempUserMsgId,
            role: "user",
            content: trimmedQuestion,
            timestamp: new Date().toISOString()
        }

        // If starting a new chat
        if (!currentConversationId) {
            setMessages([userMsg])

            const tempConvId = `temp-conv-${Date.now()}`
            const placeholderConv = {
                id: tempConvId,
                title: "",
                isPlaceholder: true,
                is_pinned: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            // Immediately display skeleton placeholder in sidebar
            setConversations((prev) => [placeholderConv, ...prev])
            setCurrentConversationId(tempConvId)

            let realConv = null
            try {
                // Create database record
                realConv = await apiCreateConversation()
                setCurrentConversationId(realConv.id)
                setConversations((prev) =>
                    prev.map((c) => (c.id === tempConvId ? { ...c, id: realConv.id } : c))
                )
            } catch (err) {
                console.error("Failed to create conversation in DB:", err)
                // Clean up optimistic state
                setConversations((prev) => prev.filter((c) => c.id !== tempConvId))
                setCurrentConversationId(null)
                setMessages([])
                setIsLoading(false)
                throw err
            }

            try {
                // Send the message to the newly created conversation
                const { message, titleUpdated } = await apiSendChatMessage(realConv.id, trimmedQuestion)

                const assistantMsg = {
                    id: `${message.id}-assistant`,
                    role: "assistant",
                    content: message.answer,
                    timestamp: message.created_at,
                    data: message.data,
                    visualization: message.visualization,
                    execution_time: message.execution_time,
                    row_count: message.row_count
                }

                setMessages([
                    {
                        id: `${message.id}-user`,
                        role: "user",
                        content: message.question,
                        timestamp: message.created_at
                    },
                    assistantMsg
                ])

                setConversations((prev) => {
                    const updatedList = prev.map((c) => {
                        if (c.id === realConv.id) {
                            return {
                                ...c,
                                title: titleUpdated || c.title,
                                isPlaceholder: false,
                                updated_at: message.created_at || new Date().toISOString()
                            }
                        }
                        return c
                    })
                    return [...updatedList].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                })
            } catch (err) {
                console.error("Failed to send first message:", err)
                // Clean up created empty conversation since first query failed
                try {
                    await apiDeleteConversation(realConv.id)
                } catch (delErr) {
                    console.error("Failed to delete orphaned conversation:", delErr)
                }
                setConversations((prev) => prev.filter((c) => c.id !== realConv.id))
                setCurrentConversationId(null)
                setMessages([])
                setIsLoading(false)
                throw err
            } finally {
                setIsLoading(false)
            }
        } else {
            // Continuation of existing conversation
            setMessages((prev) => [...prev, userMsg])

            try {
                const { message, titleUpdated } = await apiSendChatMessage(currentConversationId, trimmedQuestion)

                const assistantMsg = {
                    id: `${message.id}-assistant`,
                    role: "assistant",
                    content: message.answer,
                    timestamp: message.created_at,
                    data: message.data,
                    visualization: message.visualization,
                    execution_time: message.execution_time,
                    row_count: message.row_count
                }

                setMessages((prev) => {
                    const filtered = prev.filter((m) => m.id !== tempUserMsgId)
                    return [
                        ...filtered,
                        {
                            id: `${message.id}-user`,
                            role: "user",
                            content: message.question,
                            timestamp: message.created_at
                        },
                        assistantMsg
                    ]
                })

                setConversations((prev) => {
                    const updatedList = prev.map((c) => {
                        if (c.id === currentConversationId) {
                            return {
                                ...c,
                                title: titleUpdated || c.title,
                                updated_at: message.created_at || new Date().toISOString()
                            }
                        }
                        return c
                    })
                    return [...updatedList].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                })
            } catch (err) {
                console.error("Failed to send message:", err)
                setMessages((prev) => prev.filter((m) => m.id !== tempUserMsgId))
                setIsLoading(false)
                throw err
            } finally {
                setIsLoading(false)
            }
        }
    }, [currentConversationId, isLoading])

    // Toggle Pin state of a conversation
    const pinConversation = useCallback(async (id) => {
        try {
            await apiPinConversation(id)
            setConversations((prev) =>
                prev.map((c) => (c.id === id ? { ...c, is_pinned: true } : c))
            )
        } catch (err) {
            console.error("Failed to pin conversation:", err)
        }
    }, [])

    // Toggle Pin state off
    const unpinConversation = useCallback(async (id) => {
        try {
            await apiUnpinConversation(id)
            setConversations((prev) =>
                prev.map((c) => (c.id === id ? { ...c, is_pinned: false } : c))
            )
        } catch (err) {
            console.error("Failed to unpin conversation:", err)
        }
    }, [])

    // Delete a conversation
    const deleteConversation = useCallback(async (id) => {
        try {
            await apiDeleteConversation(id)
            setConversations((prev) => prev.filter((c) => c.id !== id))
            if (currentConversationId === id) {
                setCurrentConversationId(null)
                setMessages([])
            }
        } catch (err) {
            console.error("Failed to delete conversation:", err)
            throw err
        }
    }, [currentConversationId])

    return (
        <ConversationContext.Provider
            value={{
                conversations,
                currentConversationId,
                messages,
                isLoading,
                isHistoryLoading,
                isMessagesLoading,
                loadConversations,
                selectConversation,
                startNewChat,
                sendMessage,
                pinConversation,
                unpinConversation,
                deleteConversation
            }}
        >
            {children}
        </ConversationContext.Provider>
    )
}

export function useConversation() {
    const context = useContext(ConversationContext)
    if (!context) {
        throw new Error("useConversation must be used within a ConversationProvider")
    }
    return context
}