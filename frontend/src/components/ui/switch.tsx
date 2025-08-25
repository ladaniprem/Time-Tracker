"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-10 shrink-0 items-center rounded-full border shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
        // Always white track to match design; add subtle border when off
        "bg-white border-white data-[state=unchecked]:border-input",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          // Thumb colors
          "data-[state=checked]:bg-black data-[state=unchecked]:bg-white",
          // Add subtle outline when unchecked so white-on-white is visible
          "data-[state=unchecked]:shadow-[0_0_0_1px_rgba(0,0,0,0.25)] dark:data-[state=unchecked]:shadow-[0_0_0_1px_rgba(255,255,255,0.35)]",
          // Translate for both states
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
