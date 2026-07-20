"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmptyState } from "@/components/chat/empty-state"
import { ChatWindow } from "@/components/chat/chat-window"
import { ChatInput } from "@/components/chat/chat-input"
import { ConversationProvider, useConversation } from "@/context/ConversationContext"
import { toast } from "sonner"

function DashboardContent() {
  const [input, setInput] = useState("")
  const { messages, isLoading, sendMessage, isMessagesLoading } = useConversation()

  const hasMessages = messages.length > 0 || isMessagesLoading

  const handleSubmit = async () => {
    const question = input.trim()
    if (!question || isLoading) return

    setInput("")
    try {
      await sendMessage(question)
    } catch (err) {
      console.error("Failed to send message:", err)
      toast.error(err.message || "Failed to get response from AI. Please try again.")
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-dvh flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <AnimatePresence mode="wait">
            {hasMessages ? (
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
                  <ChatWindow messages={messages} isLoading={isLoading} isMessagesLoading={isMessagesLoading} />
                </div>
                <div className="shrink-0 border-border bg-background p-4">
                  <div className="mx-auto w-full max-w-2xl">
                    <ChatInput
                      value={input}
                      onValueChange={setInput}
                      isLoading={isLoading}
                      onSubmit={handleSubmit}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-1 flex-col items-center justify-center gap-6 p-4"
              >
                <EmptyState />
                <div className="w-full max-w-2xl">
                  <ChatInput
                    value={input}
                    onValueChange={setInput}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <ConversationProvider>
      <DashboardContent />
    </ConversationProvider>
  )
}