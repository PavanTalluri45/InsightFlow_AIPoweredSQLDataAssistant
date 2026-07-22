"use client"

import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

export default function BarChart({ data, visualization }) {
  const { title, x_axis, y_axis, series, horizontal, legend, sort } = visualization ?? {}

  if (!data?.length) {
    return null
  }

  const keys = Object.keys(data[0])
  const effectiveX = x_axis || keys[0]
  const effectiveY = y_axis || keys[1] || keys[0]

  // Check if grouped series exists
  const isGrouped = Boolean(series && data.some((d) => d[series] !== undefined))

  let processedData = [...data]
  let seriesValues = []

  if (isGrouped) {
    seriesValues = Array.from(
      new Set(data.map((d) => d[series]).filter((v) => v !== undefined && v !== null))
    )

    // Pivot un-grouped rows into wide format by effectiveX
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
    // Convert numeric string values if any
    processedData = data.map((d) => {
      const val = d[effectiveY]
      const numVal = typeof val === "number" ? val : Number(val)
      return {
        ...d,
        [effectiveY]: isNaN(numVal) ? val : numVal,
      }
    })
  }

  // Sort processedData if specified
  if (sort === "asc") {
    processedData.sort((a, b) => {
      const valA = isGrouped ? (a[seriesValues[0]] ?? 0) : (a[effectiveY] ?? 0)
      const valB = isGrouped ? (b[seriesValues[0]] ?? 0) : (b[effectiveY] ?? 0)
      return valA > valB ? 1 : -1
    })
  } else if (sort === "desc") {
    processedData.sort((a, b) => {
      const valA = isGrouped ? (a[seriesValues[0]] ?? 0) : (a[effectiveY] ?? 0)
      const valB = isGrouped ? (b[seriesValues[0]] ?? 0) : (b[effectiveY] ?? 0)
      return valA < valB ? 1 : -1
    })
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
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        {horizontal ? (
          <RechartsPrimitive.BarChart
            data={processedData}
            layout="vertical"
            margin={{ left: 24, right: 16, top: 8, bottom: 8 }}
          >
            <RechartsPrimitive.CartesianGrid horizontal={false} />
            <RechartsPrimitive.XAxis type="number" tickLine={false} axisLine={false} />
            <RechartsPrimitive.YAxis
              dataKey={effectiveX}
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={100}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {isGrouped ? (
              seriesValues.map((sVal, idx) => {
                const cleanKey = String(sVal).replace(/[^a-zA-Z0-9_-]/g, "_")
                const colorVar = `var(--chart-${(idx % 5) + 1})`
                return (
                  <RechartsPrimitive.Bar
                    key={sVal}
                    dataKey={sVal}
                    name={sVal}
                    fill={`var(--color-${cleanKey}, ${colorVar})`}
                    radius={[0, 4, 4, 0]}
                  />
                )
              })
            ) : (
              <RechartsPrimitive.Bar
                dataKey={effectiveY}
                name={effectiveY}
                fill="var(--chart-1)"
                radius={[0, 4, 4, 0]}
              >
                {processedData.map((entry, index) => (
                  <RechartsPrimitive.Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${(index % 5) + 1})`}
                  />
                ))}
              </RechartsPrimitive.Bar>
            )}
            {legend && <ChartLegend content={<ChartLegendContent />} />}
          </RechartsPrimitive.BarChart>
        ) : (
          <RechartsPrimitive.BarChart
            data={processedData}
            margin={{ left: 4, right: 4, top: 8, bottom: 8 }}
          >
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
                  <RechartsPrimitive.Bar
                    key={sVal}
                    dataKey={sVal}
                    name={sVal}
                    fill={`var(--color-${cleanKey}, ${colorVar})`}
                    radius={[4, 4, 0, 0]}
                  />
                )
              })
            ) : (
              <RechartsPrimitive.Bar
                dataKey={effectiveY}
                name={effectiveY}
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              >
                {processedData.map((entry, index) => (
                  <RechartsPrimitive.Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${(index % 5) + 1})`}
                  />
                ))}
              </RechartsPrimitive.Bar>
            )}
            {legend && <ChartLegend content={<ChartLegendContent />} />}
          </RechartsPrimitive.BarChart>
        )}
      </ChartContainer>
    </div>
  )
}