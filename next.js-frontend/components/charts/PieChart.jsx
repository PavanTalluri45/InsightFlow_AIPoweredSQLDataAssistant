"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

// Renders visualization.chart_type === "pie_chart".
// x_axis is used as the slice name, y_axis as the slice value.
// The backend contract has no per-category color field, so slice colors
// cycle through the shadcn --chart-1..5 tokens (not backend-provided data).
export default function PieChart({ data, visualization }) {
  const { title, x_axis, y_axis } = visualization ?? {}

  if (!data?.length || !x_axis || !y_axis) {
    return null
  }

  const chartConfig = data.reduce((config, row, index) => {
    const key = row[x_axis]
    config[key] = {
      label: key,
      color: PALETTE[index % PALETTE.length],
    }
    return config
  }, {})

  return (
    <div className="w-full">
      {title && (
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
      )}
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <RechartsPrimitive.PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey={x_axis} hideLabel />} />
          <RechartsPrimitive.Pie
            data={data}
            dataKey={y_axis}
            nameKey={x_axis}
            innerRadius={60}
            strokeWidth={2}
          >
            {data.map((row, index) => (
              <RechartsPrimitive.Cell
                key={`cell-${index}`}
                fill={PALETTE[index % PALETTE.length]}
              />
            ))}
          </RechartsPrimitive.Pie>
          <ChartLegend content={<ChartLegendContent nameKey={x_axis} />} />
        </RechartsPrimitive.PieChart>
      </ChartContainer>
    </div>
  )
}
