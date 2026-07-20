"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { ChatMessage } from "@/components/chat/chat-message"
import { TypingIndicator } from "@/components/chat/typing-indicator"

const ChatSkeleton = () => (
    <div className="flex flex-col gap-6 w-full animate-pulse py-4">
        {/* User Message Skeleton */}
        <div className="flex justify-end w-full">
            <div className="flex flex-col items-end gap-1 max-w-[70%] w-1/3">
                <div className="h-9 w-full rounded-2xl bg-primary/10" />
            </div>
        </div>
        {/* Assistant Message Skeleton */}
        <div className="flex justify-start w-full">
            <div className="flex flex-col items-start gap-1 max-w-[70%] w-1/2">
                <div className="h-14 w-full rounded-2xl bg-muted/60" />
            </div>
        </div>
    </div>
)

export function ChatWindow({ messages, isLoading, isMessagesLoading }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        if (!isMessagesLoading) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isLoading, isMessagesLoading])

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
            {isMessagesLoading ? (
                <ChatSkeleton />
            ) : (
                <>
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                role={message.role}
                                content={message.content}
                                timestamp={message.timestamp}
                                data={message.data}
                                visualization={message.visualization}
                            />
                        ))}
                    </AnimatePresence>
                    {isLoading && <TypingIndicator />}
                </>
            )}
            <div ref={bottomRef} />
        </div>
    )
}