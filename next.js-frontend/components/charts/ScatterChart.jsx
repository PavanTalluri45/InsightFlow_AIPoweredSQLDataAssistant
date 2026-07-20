"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Renders visualization.chart_type === "scatter_chart".
// Both axes are treated as numeric, per Recharts' ScatterChart contract.
export default function ScatterChart({ data, visualization }) {
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
        <RechartsPrimitive.ScatterChart margin={{ left: 4, right: 4 }}>
          <RechartsPrimitive.CartesianGrid />
          <RechartsPrimitive.XAxis
            dataKey={x_axis}
            type="number"
            name={x_axis}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsPrimitive.YAxis
            dataKey={y_axis}
            type="number"
            name={y_axis}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
          <RechartsPrimitive.Scatter data={data} fill={`var(--color-${y_axis})`} />
        </RechartsPrimitive.ScatterChart>
      </ChartContainer>
    </div>
  )
}
