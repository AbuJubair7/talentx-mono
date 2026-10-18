import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50",
        className
      )}
      onWheel={(event) => {
        if (type === "number") {
          event.currentTarget.blur()
        }
        props.onWheel?.(event)
      }}
      onKeyDown={(event) => {
        if (type === "number" && (props.min === 0 || props.min === "0")) {
          if (event.key === "-" || event.key === "e" || event.key === "E") {
            event.preventDefault()
          }
        }
        props.onKeyDown?.(event)
      }}
      {...props}
    />
  )
}

export { Input }
