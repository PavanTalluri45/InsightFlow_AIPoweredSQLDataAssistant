"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Renders visualization.chart_type === "bar_chart".
// Reads ONLY `data` and `visualization` — never transforms backend values,
// never hardcodes axis or field names.
export default function BarChart({ data, visualization }) {
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
        <RechartsPrimitive.BarChart data={data} margin={{ left: 4, right: 4 }}>
          <RechartsPrimitive.CartesianGrid vertical={false} />
          <RechartsPrimitive.XAxis
            dataKey={x_axis}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <RechartsPrimitive.Bar
            dataKey={y_axis}
            fill={`var(--color-${y_axis})`}
            radius={4}
          />
        </RechartsPrimitive.BarChart>
      </ChartContainer>
    </div>
  )
}
