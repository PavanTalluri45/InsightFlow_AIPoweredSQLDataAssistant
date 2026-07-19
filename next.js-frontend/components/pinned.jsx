"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ConversationItem } from "@/components/conversation-item"
import { CollapsibleSidebarGroup } from "@/components/collapsible-sidebar-group"

export const Pinned = React.memo(function Pinned({
    conversations,
    activeId,
    onSelect,
    onUnpin,
    onDelete,
}) {
    return (
        <AnimatePresence initial={false}>
            {conversations.length > 0 && (
                <motion.div
                    key="pinned-group"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}>
                    <CollapsibleSidebarGroup label="Pinned">
                        {conversations.map((conversation) => (
                            <ConversationItem
                                key={conversation.id}
                                conversation={conversation}
                                isActive={conversation.id === activeId}
                                isPinned
                                onSelect={onSelect}
                                onUnpin={onUnpin}
                                onDelete={onDelete}
                            />
                        ))}
                    </CollapsibleSidebarGroup>
                </motion.div>
            )}
        </AnimatePresence>
    )
})