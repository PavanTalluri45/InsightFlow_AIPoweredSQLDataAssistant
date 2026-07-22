"use client"

// Renders visualization.chart_type === "table".
// Columns are derived from the data's own keys — nothing hardcoded.
export default function DataTable({ data, visualization }) {
  const { title } = visualization ?? {}

  if (!data?.length) {
    return null
  }

  const columns = Object.keys(data[0])

  return (
    <div className="w-full">
      {title && (
        <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
      )}
      <div className="w-full overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 bg-muted/40">
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-2.5 py-1.5 text-left font-medium text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border/50 last:border-0"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="whitespace-nowrap px-2.5 py-1.5 font-mono text-foreground tabular-nums"
                  >
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}