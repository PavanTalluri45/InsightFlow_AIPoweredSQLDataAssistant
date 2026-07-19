"use client"

import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Square } from "lucide-react"

/**
 * chat-input.jsx
 *
 * Single responsibility: the input control itself. Whether it ends up
 * centered on an empty page or pinned to the bottom of an active
 * conversation is a layout decision made by the parent page, not this
 * component — that's what lets the same component serve both states.
 */
export function ChatInput({ value, onValueChange, isLoading, onSubmit }) {
    return (
        <PromptInput
            value={value}
            onValueChange={onValueChange}
            isLoading={isLoading}
            onSubmit={onSubmit}
        >
            <PromptInputTextarea placeholder="Ask about your data..." />
            <PromptInputActions className="justify-end pt-2">
                <PromptInputAction
                    tooltip={isLoading ? "Stop generation" : "Send message"}
                >
                    <Button
                        variant="default"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={onSubmit}
                    >
                        {isLoading ? (
                            <Square className="size-4 fill-current" />
                        ) : (
                            <ArrowUp className="size-4" />
                        )}
                    </Button>
                </PromptInputAction>
            </PromptInputActions>
        </PromptInput>
    )
}