"use client"

import * as React from "react"
import { Pin } from "lucide-react"
import { ConversationItem } from "@/components/conversation-item"
import { CollapsibleSidebarGroup } from "@/components/collapsible-sidebar-group"
import { Pinned } from "@/components/pinned"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useConversation } from "@/context/ConversationContext"
import { toast } from "sonner"

export const History = React.memo(function History() {
    const { state, isMobile } = useSidebar()
    const {
        conversations,
        currentConversationId: activeId,
        selectConversation: setActiveId,
        pinConversation: handlePin,
        unpinConversation: handleUnpin,
        deleteConversation: handleConfirmDeleteDirect,
        isHistoryLoading,
    } = useConversation()

    const [deleteTarget, setDeleteTarget] = React.useState(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const isCollapsed = state === "collapsed" && !isMobile

    const pinnedConversations = React.useMemo(
        () => conversations.filter((c) => c.is_pinned),
        [conversations]
    )
    const historyConversations = React.useMemo(
        () => conversations.filter((c) => !c.is_pinned),
        [conversations]
    )

    const handleRequestDelete = React.useCallback((conversation) => {
        setDeleteTarget(conversation)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleConfirmDelete = React.useCallback(async () => {
        if (deleteTarget) {
            setIsDeleting(true)
            try {
                await handleConfirmDeleteDirect(deleteTarget.id)
                setIsDeleteDialogOpen(false)
            } catch (err) {
                console.error("Failed to delete conversation:", err)
                toast.error("Failed to delete conversation. Please try again.")
            } finally {
                setIsDeleting(false)
            }
        }
    }, [deleteTarget, handleConfirmDeleteDirect])

    if (isHistoryLoading) {
        return (
            <div className="flex flex-col gap-3 px-3 py-4">
                <Skeleton className="h-3 w-16 bg-muted/60 mb-1" />
                <Skeleton className="h-9 w-full bg-muted/40" />
                <Skeleton className="h-9 w-full bg-muted/40" />
                <Skeleton className="h-9 w-full bg-muted/40" />
                <Skeleton className="h-9 w-full bg-muted/40" />
            </div>
        )
    }

    if (conversations.length === 0) {
        return null
    }

    if (isCollapsed) {
        if (pinnedConversations.length === 0) {
            return null
        }

        return (
            <div className="flex justify-center">
                <TooltipProvider delay={0}>
                    <Tooltip>
                        <TooltipTrigger render={<Button variant="ghost" size="icon-sm" />}>
                            <Pin className="size-5" />
                            <span className="sr-only">Pinned</span>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            Pinned
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }

    return (
        <>
            <Pinned
                conversations={pinnedConversations}
                activeId={activeId}
                onSelect={setActiveId}
                onUnpin={handleUnpin}
                onDelete={handleRequestDelete}
            />

            {historyConversations.length > 0 && (
                <CollapsibleSidebarGroup label="History">
                    {historyConversations.map((conversation) => (
                        <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={conversation.id === activeId}
                            isPinned={false}
                            onSelect={setActiveId}
                            onPin={handlePin}
                            onDelete={handleRequestDelete}
                        />
                    ))}
                </CollapsibleSidebarGroup>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete "{deleteTarget?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <Spinner className="size-3.5" />
                                    Deleting
                                </span>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
})