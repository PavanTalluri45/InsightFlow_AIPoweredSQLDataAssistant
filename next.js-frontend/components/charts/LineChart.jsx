"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

export default function LineChart({ data, visualization }) {
  const { title, x_axis, y_axis, series, legend, sort } = visualization ?? {}

  if (!data?.length) {
    return null
  }

  const keys = Object.keys(data[0])
  const effectiveX = x_axis || keys[0]
  const effectiveY = y_axis || keys[1] || keys[0]

  const isGrouped = Boolean(series && data.some((d) => d[series] !== undefined))

  let processedData = [...data]
  let seriesValues = []

  if (isGrouped) {
    seriesValues = Array.from(
      new Set(data.map((d) => d[series]).filter((v) => v !== undefined && v !== null))
    )

    const pivotedMap = new Map()
    data.forEach((row) => {
      const xVal = row[effectiveX]
      const sVal = row[series]
      const yVal = row[effectiveY]

      if (xVal === undefined || xVal === null) return

      if (!pivotedMap.has(xVal)) {
        pivotedMap.set(xVal, { [effectiveX]: xVal })
      }
      if (sVal !== undefined && sVal !== null) {
        const numVal = typeof yVal === "number" ? yVal : Number(yVal)
        pivotedMap.get(xVal)[sVal] = isNaN(numVal) ? yVal : numVal
      }
    })
    processedData = Array.from(pivotedMap.values())
  } else {
    processedData = data.map((d) => {
      const val = d[effectiveY]
      const numVal = typeof val === "number" ? val : Number(val)
      return {
        ...d,
        [effectiveY]: isNaN(numVal) ? val : numVal,
      }
    })
  }

  if (sort === "asc") {
    processedData.sort((a, b) => (a[effectiveX] > b[effectiveX] ? 1 : -1))
  } else if (sort === "desc") {
    processedData.sort((a, b) => (a[effectiveX] < b[effectiveX] ? 1 : -1))
  }

  const chartConfig = isGrouped
    ? seriesValues.reduce((config, key, idx) => {
        const cleanKey = String(key).replace(/[^a-zA-Z0-9_-]/g, "_")
        const color = `var(--chart-${(idx % 5) + 1})`
        config[key] = {
          label: String(key),
          color,
        }
        if (cleanKey !== String(key)) {
          config[cleanKey] = config[key]
        }
        return config
      }, {})
    : {
        [effectiveY]: {
          label: String(effectiveY),
          color: "var(--chart-1)",
        },
      }

  return (
    <div className="w-full">
      {title && (
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
      )}
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <RechartsPrimitive.LineChart data={processedData} margin={{ left: 4, right: 4 }}>
          <RechartsPrimitive.CartesianGrid vertical={false} />
          <RechartsPrimitive.XAxis
            dataKey={effectiveX}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {isGrouped ? (
            seriesValues.map((sVal, idx) => {
              const cleanKey = String(sVal).replace(/[^a-zA-Z0-9_-]/g, "_")
              const colorVar = `var(--chart-${(idx % 5) + 1})`
              return (
                <RechartsPrimitive.Line
                  key={sVal}
                  type="monotone"
                  dataKey={sVal}
                  name={sVal}
                  stroke={`var(--color-${cleanKey}, ${colorVar})`}
                  strokeWidth={2}
                  dot={{ fill: `var(--color-${cleanKey}, ${colorVar})`, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )
            })
          ) : (
            <RechartsPrimitive.Line
              type="monotone"
              dataKey={effectiveY}
              name={effectiveY}
              stroke="var(--color-1, var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: "var(--chart-1)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          )}
          {legend && <ChartLegend content={<ChartLegendContent />} />}
        </RechartsPrimitive.LineChart>
      </ChartContainer>
    </div>
  )
}