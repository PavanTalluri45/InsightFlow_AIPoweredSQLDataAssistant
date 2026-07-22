"use client"


export function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-lg font-medium text-foreground">
                Ask questions about retails sales data
            </h2>
            <p className="text-sm text-muted-foreground">
                I can help you explore, analyze, and understand your dataset.
            </p>
        </div>
    )
}
