"use client"

import * as React from "react"
import { PanelLeftIcon, CirclePlus } from "lucide-react"
import { History } from "@/components/history"
import { NavUser } from "@/components/nav-user"
import { Button } from "@/components/ui/button"
import { useConversation } from "@/context/ConversationContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function SidebarHeaderTrigger() {
  const { state, isMobile, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile
  const label = isCollapsed ? "Open Sidebar" : "Close Sidebar"

  return (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger
          render={<Button variant="ghost" size="icon-sm" onClick={toggleSidebar} />}>
          <PanelLeftIcon className="size-5" />
          <span className="sr-only">{label}</span>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function NewChatButton() {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile
  const { startNewChat } = useConversation()

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <TooltipProvider delay={0}>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={startNewChat} />}>
              <CirclePlus className="size-5" />
              <span className="sr-only">New Chat</span>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              New Chat
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="lg" className="w-full justify-start gap-2" onClick={startNewChat}>
      <CirclePlus className="size-5" />
      <span>New Chat</span>
    </Button>
  );
}


export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            "group-data-[collapsible=icon]:justify-center"
          )}>
          <h1 className="truncate text-xl group-data-[collapsible=icon]:hidden">
            Insight Flow
          </h1>
          <SidebarHeaderTrigger />
        </div>
        <NewChatButton />
      </SidebarHeader>
      <SidebarContent>
        <History />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}