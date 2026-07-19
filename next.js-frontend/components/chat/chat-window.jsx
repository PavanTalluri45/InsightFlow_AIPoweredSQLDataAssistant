"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { ChatMessage } from "@/components/chat/chat-message"
import { TypingIndicator } from "@/components/chat/typing-indicator"

/**
 * chat-window.jsx
 *
 * Single responsibility: render the scrollable message list and keep
 * the newest message in view. It doesn't know about the input, and it
 * doesn't know or care where messages come from — it just renders the
 * `messages` array it's given.
 */
export function ChatWindow({ messages, isLoading }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isLoading])

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
            <AnimatePresence initial={false}>
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                    />
                ))}
            </AnimatePresence>
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
        </div>
    )
}