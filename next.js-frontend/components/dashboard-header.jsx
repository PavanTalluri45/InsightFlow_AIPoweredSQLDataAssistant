"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
    const { user, loading } = useAuth()

    if (loading || user) return null

    return (
        <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-3">
            <Button render={<a href="/login" />} nativeButton={false} variant="ghost" size="sm">
                Log in
            </Button>
            <Button render={<a href="/signup" />} nativeButton={false} size="sm">
                Sign up
            </Button>
        </div>
    )
}