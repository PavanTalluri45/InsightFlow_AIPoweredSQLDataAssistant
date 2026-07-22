"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

export default function PieChart({ data, visualization }) {
  const { title, x_axis, y_axis } = visualization ?? {}

  if (!data?.length) {
    return null
  }

  const keys = Object.keys(data[0])
  const effectiveX = x_axis || keys[0]
  const effectiveY = y_axis || keys[1] || keys[0]

  const chartConfig = data.reduce((config, row, index) => {
    const key = row[effectiveX]
    if (key !== undefined && key !== null) {
      const cleanKey = String(key).replace(/[^a-zA-Z0-9_-]/g, "_")
      const color = `var(--chart-${(index % 5) + 1})`
      config[key] = {
        label: String(key),
        color,
      }
      if (cleanKey !== String(key)) {
        config[cleanKey] = config[key]
      }
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
          <ChartTooltip content={<ChartTooltipContent nameKey={effectiveX} hideLabel />} />
          <RechartsPrimitive.Pie
            data={data}
            dataKey={effectiveY}
            nameKey={effectiveX}
            innerRadius={60}
            strokeWidth={2}
          >
            {data.map((row, index) => (
              <RechartsPrimitive.Cell
                key={`cell-${index}`}
                fill={`var(--chart-${(index % 5) + 1})`}
              />
            ))}
          </RechartsPrimitive.Pie>
          <ChartLegend content={<ChartLegendContent nameKey={effectiveX} />} />
        </RechartsPrimitive.PieChart>
      </ChartContainer>
    </div>
  )
}