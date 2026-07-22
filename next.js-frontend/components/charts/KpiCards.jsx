"use client"

import { cn } from "@/lib/utils"

export default function KpiCards({ data, visualization }) {
  const { title, x_axis, y_axis } = visualization ?? {}

  if (!data?.length || !y_axis) {
    return null
  }

  return (
    <div className="w-full">
      {title && (
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
      )}
      <div
        className={cn(
          "grid gap-3",
          data.length === 1 && "grid-cols-1",
          data.length === 2 && "grid-cols-2",
          data.length >= 3 && "grid-cols-2 sm:grid-cols-3"
        )}
      >
        {data.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border border-border/50 bg-background p-4 shadow-xs"
          >
            <p className="text-xs text-muted-foreground">
              {x_axis && row[x_axis] ? String(row[x_axis]) : y_axis}
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {typeof row[y_axis] === "number"
                ? row[y_axis].toLocaleString()
                : String(row[y_axis] ?? "")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}