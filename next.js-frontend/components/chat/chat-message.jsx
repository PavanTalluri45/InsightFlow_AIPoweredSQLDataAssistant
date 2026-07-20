"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import ChartRenderer from "@/components/charts/ChartRenderer"

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


export function ChatMessage({ role, content, timestamp, data, visualization }) {
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
                    "flex max-w-[85%] flex-col gap-2 sm:max-w-[80%]",
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

                {!isUser && visualization?.required && (
                    <div className="w-full overflow-hidden rounded-xl border border-border bg-card p-4">
                        <ChartRenderer data={data} visualization={visualization} />
                    </div>
                )}

                {timestamp && (
                    <span className="px-1 text-xs text-muted-foreground">
                        {formatTimestamp(timestamp)}
                    </span>
                )}
            </div>
        </motion.div>
    )
}