"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const userVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
}

const assistantVariants = {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
}

function formatTimestamp(timestamp) {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}

/**
 * chat-message.jsx
 *
 * Renders a single message bubble. Single responsibility: presentation
 * and entrance animation for one message — no data fetching, no state,
 * no knowledge of the conversation as a whole.
 */
export function ChatMessage({ role, content, timestamp }) {
    const isUser = role === "user"

    return (
        <motion.div
            variants={isUser ? userVariants : assistantVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn("flex", isUser ? "justify-end" : "justify-start")}
        >
            <div
                className={cn(
                    "flex max-w-[80%] flex-col gap-1 sm:max-w-[70%]",
                    isUser ? "items-end" : "items-start"
                )}
            >
                <div
                    className={cn(
                        "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                        isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                    )}
                >
                    {content}
                </div>
                {timestamp && (
                    <span className="px-1 text-xs text-muted-foreground">
                        {formatTimestamp(timestamp)}
                    </span>
                )}
            </div>
        </motion.div>
    )
}