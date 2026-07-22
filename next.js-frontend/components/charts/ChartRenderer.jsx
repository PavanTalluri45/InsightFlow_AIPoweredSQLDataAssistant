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
  kpi: KpiCards,
  kpi_cards: KpiCards,
  table: DataTable,
}

export default function ChartRenderer({ data, visualization }) {
  if (!visualization) {
    return <EmptyChart />
  }

  const { presentation, chart_type } = visualization

  // Presentation 1: TABLE
  if (presentation === "table" || chart_type === "table") {
    return <DataTable data={data} visualization={visualization} />
  }

  // Presentation 2: KPI
  if (presentation === "kpi" || chart_type === "kpi" || chart_type === "kpi_cards") {
    return <KpiCards data={data} visualization={visualization} />
  }

  // Presentation 3: CHART
  const ChartComponent = CHART_COMPONENTS[chart_type]

  if (!ChartComponent) {
    return (
      <EmptyChart reason={visualization.reason || `Unsupported chart type: "${chart_type}"`} />
    )
  }

  return <ChartComponent data={data} visualization={visualization} />
}