"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function AreaChart({ data, visualization }) {
  const { title, x_axis, y_axis, sort } = visualization ?? {}

  if (!data?.length) {
    return null
  }

  const keys = Object.keys(data[0])
  const effectiveX = x_axis || keys[0]
  const effectiveY = y_axis || keys[1] || keys[0]

  const cleanY = String(effectiveY).replace(/[^a-zA-Z0-9_-]/g, "_")
  const colorVar = "var(--chart-1)"

  // Sort data if specified
  const sortedData = [...data]
  if (sort === "asc") {
    sortedData.sort((a, b) => (a[effectiveX] > b[effectiveX] ? 1 : -1))
  } else if (sort === "desc") {
    sortedData.sort((a, b) => (a[effectiveX] < b[effectiveX] ? 1 : -1))
  }

  const chartConfig = {
    [effectiveY]: {
      label: String(effectiveY),
      color: colorVar,
    },
    [cleanY]: {
      label: String(effectiveY),
      color: colorVar,
    },
  }

  return (
    <div className="w-full">
      {title && (
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
      )}
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <RechartsPrimitive.AreaChart data={sortedData} margin={{ left: 4, right: 4 }}>
          <defs>
            <linearGradient id={`fill-${cleanY}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={`var(--color-${cleanY}, ${colorVar})`}
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${cleanY}, ${colorVar})`}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <RechartsPrimitive.CartesianGrid vertical={false} />
          <RechartsPrimitive.XAxis
            dataKey={effectiveX}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <RechartsPrimitive.Area
            type="monotone"
            dataKey={effectiveY}
            name={effectiveY}
            stroke={`var(--color-${cleanY}, ${colorVar})`}
            fill={`url(#fill-${cleanY})`}
            strokeWidth={2}
          />
        </RechartsPrimitive.AreaChart>
      </ChartContainer>
    </div>
  )
}