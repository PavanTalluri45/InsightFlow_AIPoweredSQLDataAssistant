"use client"

import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { createContext, useContext, useEffect, useRef, useState } from "react"

const PromptInputContext = createContext({
    isLoading: false,
    value: "",
    setValue: () => { },
    maxHeight: 240,
    onSubmit: undefined,
    disabled: false,
})

function usePromptInput() {
    const context = useContext(PromptInputContext)
    if (!context) {
        throw new Error("usePromptInput must be used within a PromptInput")
    }
    return context
}

function PromptInput({
    className,
    isLoading = false,
    maxHeight = 240,
    value,
    onValueChange,
    onSubmit,
    disabled = false,
    children,
}) {
    const [internalValue, setInternalValue] = useState(value || "")

    const handleChange = (newValue) => {
        setInternalValue(newValue)
        onValueChange?.(newValue)
    }

    return (
        <TooltipProvider>
            <PromptInputContext.Provider
                value={{
                    isLoading,
                    value: value ?? internalValue,
                    setValue: onValueChange ?? handleChange,
                    maxHeight,
                    onSubmit,
                    disabled,
                }}
            >
                <div
                    data-slot="prompt-input"
                    className={cn(
                        "border-input rounded-3xl border p-2 ",
                        className
                    )}
                >
                    {children}
                </div>
            </PromptInputContext.Provider>
        </TooltipProvider>
    )
}

function PromptInputTextarea({
    className,
    onKeyDown,
    disableAutosize = false,
    ...props
}) {
    const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput()
    const textareaRef = useRef(null)

    useEffect(() => {
        if (disableAutosize) return
        if (!textareaRef.current) return

        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height =
            typeof maxHeight === "number"
                ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
                : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`
    }, [value, maxHeight, disableAutosize])

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSubmit?.()
        }
        onKeyDown?.(e)
    }

    return (
        <Textarea
            data-slot="prompt-input-textarea"
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
                "text-foreground min-h-[44px] w-full resize-none border-none  px-2 py-2 shadow-none outline-none focus-visible:ring-0",
                className
            )}
            rows={1}
            disabled={disabled}
            {...props}
        />
    )
}

function PromptInputActions({ children, className, ...props }) {
    return (
        <div
            data-slot="prompt-input-actions"
            className={cn("flex items-center gap-2", className)}
            {...props}
        >
            {children}
        </div>
    )
}

function PromptInputAction({
    tooltip,
    children,
    className,
    side = "top",
    ...props
}) {
    return (
        <Tooltip {...props}>
            <TooltipTrigger render={children} />
            <TooltipContent side={side} className={className}>
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

export { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction }