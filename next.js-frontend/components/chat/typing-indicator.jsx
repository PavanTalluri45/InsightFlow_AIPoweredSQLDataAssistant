"use client"

/**
 * typing-indicator.jsx
 *
 * Presentational "thinking" bubble shown while mock-chat-service (or,
 * later, the real backend) resolves. No state, no props beyond styling.
 */
export function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                <span
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "0ms" }}
                />
                <span
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "150ms" }}
                />
                <span
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: "300ms" }}
                />
            </div>
        </div>
    )
}