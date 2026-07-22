"use client"

import * as React from "react"
import { EllipsisIcon, Pin, PinOff, Trash2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuItem } from "@/components/ui/sidebar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


export const ConversationItem = React.memo(function ConversationItem({
    conversation,
    isActive,
    isPinned,
    onSelect,
    onPin,
    onUnpin,
    onDelete,
}) {
    return (
        <SidebarMenuItem>
            <div
                className={cn(
                    "group/history-item relative flex h-10 items-center rounded-md pr-7 text-sm transition-colors hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                    isActive && "bg-muted"
                )}>
                <TooltipProvider delay={0}>
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => onSelect(conversation.id)}
                                    className="flex h-full min-w-0 flex-1 items-center justify-start px-2.5 text-left outline-none"
                                />
                            }>
                            <span className="block min-w-0 truncate w-full">
                                {conversation.title}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            align="center"
                            sideOffset={43}
                            className="w-fit w-44 whitespace-normal break-words"
                        >
                            {conversation.title}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="absolute right-1 flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="opacity-0 transition-opacity group-hover/history-item:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
                                />
                            }>
                            <EllipsisIcon className="size-5" />
                            <span className="sr-only">More options for {conversation.title}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start" sideOffset={8}>
                            {isPinned ? (
                                <DropdownMenuItem onClick={() => onUnpin(conversation.id)}>
                                    <PinOff className="size-4" />
                                    Unpin Chat
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => onPin(conversation.id)}>
                                    <Pin className="size-4" />
                                    Pin Chat
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(conversation)}>
                                <Trash2Icon className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </SidebarMenuItem>
    )
})