interface TruncatedTextProps {
  text: string
  maxLength?: number
  className?: string
}

export function TruncatedText({ text, maxLength = 8, className = "" }: TruncatedTextProps) {
  if (!text || text.length <= maxLength) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={`group/truncated relative inline-block cursor-default ${className}`}>
      {text.slice(0, maxLength)}...
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-50 mt-1.5 hidden items-center whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md animate-in fade-in-0 zoom-in-95 group-hover/truncated:flex"
      >
        {text}
      </span>
    </span>
  )
}
