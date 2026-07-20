"use client"

import BarChart from "@/components/charts/BarChart"
import LineChart from "@/components/charts/LineChart"
import PieChart from "@/components/charts/PieChart"
import AreaChart from "@/components/charts/AreaChart"
import ScatterChart from "@/components/charts/ScatterChart"
import KpiCards from "@/components/charts/KpiCards"
import DataTable from "@/components/charts/DataTable"
import EmptyChart from "@/components/charts/EmptyChart"

const CHART_COMPONENTS = {
  bar_chart: BarChart,
  line_chart: LineChart,
  pie_chart: PieChart,
  area_chart: AreaChart,
  scatter_chart: ScatterChart,
  kpi_cards: KpiCards,
  table: DataTable,
}


export default function ChartRenderer({ data, visualization }) {
  if (!visualization?.required) {
    return <EmptyChart />
  }

  const ChartComponent = CHART_COMPONENTS[visualization.chart_type]

  if (!ChartComponent) {
    return (
      <EmptyChart reason={`Unsupported chart type: "${visualization.chart_type}"`} />
    )
  }

  return <ChartComponent data={data} visualization={visualization} />
}
