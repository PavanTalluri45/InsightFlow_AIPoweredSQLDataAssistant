"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function ScatterChart({ data, visualization }) {
  const { title, x_axis, y_axis } = visualization ?? {}

  if (!data?.length) {
    return null
  }

  const keys = Object.keys(data[0])
  const effectiveX = x_axis || keys[0]
  const effectiveY = y_axis || keys[1] || keys[0]

  const cleanY = String(effectiveY).replace(/[^a-zA-Z0-9_-]/g, "_")
  const colorVar = "var(--chart-1)"

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
        <RechartsPrimitive.ScatterChart margin={{ left: 4, right: 4 }}>
          <RechartsPrimitive.CartesianGrid />
          <RechartsPrimitive.XAxis
            dataKey={effectiveX}
            type="number"
            name={effectiveX}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsPrimitive.YAxis
            dataKey={effectiveY}
            type="number"
            name={effectiveY}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
          <RechartsPrimitive.Scatter data={data} fill={`var(--color-${cleanY}, ${colorVar})`} />
        </RechartsPrimitive.ScatterChart>
      </ChartContainer>
    </div>
  )
}