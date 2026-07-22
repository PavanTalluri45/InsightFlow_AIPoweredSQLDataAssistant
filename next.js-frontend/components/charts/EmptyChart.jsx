"use client"


export default function EmptyChart({ reason }) {
  if (!reason) {
    return null
  }

  return (
    <div className="w-full rounded-lg border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground">
      {reason}
    </div>
  )
}