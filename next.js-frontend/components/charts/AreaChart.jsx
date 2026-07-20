"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Renders visualization.chart_type === "area_chart".
export default function AreaChart({ data, visualization }) {
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
        <RechartsPrimitive.AreaChart data={data} margin={{ left: 4, right: 4 }}>
          <defs>
            <linearGradient id={`fill-${y_axis}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={`var(--color-${y_axis})`}
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${y_axis})`}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <RechartsPrimitive.CartesianGrid vertical={false} />
          <RechartsPrimitive.XAxis
            dataKey={x_axis}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <RechartsPrimitive.Area
            type="monotone"
            dataKey={y_axis}
            stroke={`var(--color-${y_axis})`}
            fill={`url(#fill-${y_axis})`}
            strokeWidth={2}
          />
        </RechartsPrimitive.AreaChart>
      </ChartContainer>
    </div>
  )
}
