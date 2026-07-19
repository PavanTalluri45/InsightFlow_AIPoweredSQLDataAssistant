"use client"

/**
 * empty-state.jsx
 *
 * Shown before the first message exists. Single responsibility: the
 * "nothing here yet" messaging. Layout positioning (centering it on the
 * page) is a decision for the parent page, not this component — that
 * keeps it reusable if the empty state ever needs to appear elsewhere.
 */
export function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <span className="text-lg font-semibold">IF</span>
            </div>
            <h2 className="text-lg font-medium text-foreground">
                Ask a question about your data
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
                Try something like "What were last month's top selling products?"
            </p>
        </div>
    )
}
