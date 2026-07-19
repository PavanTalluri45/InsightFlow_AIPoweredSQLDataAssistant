"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmptyState } from "@/components/chat/empty-state"
import { ChatWindow } from "@/components/chat/chat-window"
import { ChatInput } from "@/components/chat/chat-input"
import { mockChatService } from "@/services/mock-chat-service"

let messageCounter = 0
function nextId() {
  messageCounter += 1
  return `msg-${messageCounter}-${Date.now()}`
}

export default function Page() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([])

  const hasMessages = messages.length > 0

  const handleSubmit = async () => {
    const question = input.trim()
    if (!question || isLoading) return

    const userMessage = {
      id: nextId(),
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Swap mockChatService for a call to the FastAPI chat_service endpoint
    // (python-backend/app/services/chat_service.py) when the backend is
    // ready — mockChatService.ask() and the real call return the same
    // { answer, timestamp } shape, so nothing else in this file changes.
    const { answer, timestamp } = await mockChatService.ask(question)

    const assistantMessage = {
      id: nextId(),
      role: "assistant",
      content: answer,
      timestamp,
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
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
                  <ChatWindow messages={messages} isLoading={isLoading} />
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