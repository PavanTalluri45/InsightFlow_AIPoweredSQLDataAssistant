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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const mockConversations = [
    { id: "1", title: "Optimizing Slow JOIN Queries on the Orders Table" },
    { id: "2", title: "Monthly Revenue Breakdown by Region" },
    { id: "3", title: "Customer Churn Analysis" },
    { id: "4", title: "Building a Recursive CTE for the Org Chart" },
    { id: "5", title: "Comparing Q3 vs Q4 Sales Trends" },
    { id: "6", title: "Deduplicating Customer Records" },
    { id: "7", title: "Explain This Query Execution Plan" },
    { id: "8", title: "Top 10 Products by Revenue" },
    { id: "9", title: "Inventory Levels Below Reorder Threshold" },
    { id: "10", title: "Weekly Active Users Trend" },
    { id: "11", title: "Comparing Q3 vs Q4 Sales Trends" },
    { id: "12", title: "Deduplicating Customer Records" },
    { id: "13", title: "Explain This Query Execution Plan" },
    { id: "14", title: "Top 10 Products by Revenue" },
    { id: "15", title: "Inventory Levels Below Reorder Threshold" },
    { id: "16", title: "Weekly Active Users Trend" },
]

export const History = React.memo(function History({
    conversations: initialConversations = mockConversations,
}) {
    const { state, isMobile } = useSidebar()
    const [conversations, setConversations] = React.useState(() =>
        initialConversations.map((c) => ({ isPinned: false, ...c }))
    )
    const [activeId, setActiveId] = React.useState(null)
    const [deleteTarget, setDeleteTarget] = React.useState(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const isCollapsed = state === "collapsed" && !isMobile

    const pinnedConversations = React.useMemo(
        () => conversations.filter((c) => c.isPinned),
        [conversations]
    )
    const historyConversations = React.useMemo(
        () => conversations.filter((c) => !c.isPinned),
        [conversations]
    )

    const handlePin = React.useCallback((id) => {
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isPinned: true } : c))
        )
    }, [])

    const handleUnpin = React.useCallback((id) => {
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isPinned: false } : c))
        )
    }, [])

    const handleRequestDelete = React.useCallback((conversation) => {
        setDeleteTarget(conversation)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleConfirmDelete = React.useCallback(() => {
        setConversations((prev) => prev.filter((c) => c.id !== deleteTarget.id))
        if (deleteTarget.id === activeId) {
            setActiveId(null)
        }
        setIsDeleteDialogOpen(false)
    }, [deleteTarget, activeId])

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
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
})