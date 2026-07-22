export function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <span className="relative flex size-4.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75" />
                <span className="relative inline-flex size-4.5 rounded-full bg-muted-foreground" />
            </span>
        </div>
    );
}
