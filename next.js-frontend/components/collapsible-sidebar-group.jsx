"use client"

import * as React from "react"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar"

/**
 * Wraps a SidebarGroup so its label doubles as a collapse/expand trigger.
 * The chevron is always in the DOM (never conditionally rendered) so
 * hovering the label never shifts layout — only its opacity/rotation change.
 */
export const CollapsibleSidebarGroup = React.memo(function CollapsibleSidebarGroup({
    label,
    children,
}) {
    const [isOpen, setIsOpen] = React.useState(true)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <SidebarGroup>
                <SidebarGroupLabel className="p-0">
                    <CollapsibleTrigger className="group/collapsible-label flex h-full w-full items-center gap-2 rounded-md px-2 text-left outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
                        <span className="truncate">{label}</span>
                        <ChevronRightIcon
                            className={cn(
                                "size-4 shrink-0 text-muted-foreground opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover/collapsible-label:opacity-100 group-focus-visible/collapsible-label:opacity-100",
                                isOpen && "rotate-90"
                            )}
                        />
                    </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out">
                    <SidebarMenu className="gap-0.5">{children}</SidebarMenu>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    )
})