"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Renders visualization.chart_type === "line_chart".
export default function LineChart({ data, visualization }) {
  const { title, x_axis, y_axis } = visualization ?? {}

  if (!data?.length || !x_axis || !y_axis) {
    return null
  }

  const chartConfig = {
    [y_axis]: {
      label: y_axis,
      color: "var(--chart-1)",
    },
  }

  return (
    <div className="w-full">
      {title && (
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
      )}
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <RechartsPrimitive.LineChart data={data} margin={{ left: 4, right: 4 }}>
          <RechartsPrimitive.CartesianGrid vertical={false} />
          <RechartsPrimitive.XAxis
            dataKey={x_axis}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <RechartsPrimitive.Line
            type="monotone"
            dataKey={y_axis}
            stroke={`var(--color-${y_axis})`}
            strokeWidth={2}
            dot={false}
          />
        </RechartsPrimitive.LineChart>
      </ChartContainer>
    </div>
  )
}
