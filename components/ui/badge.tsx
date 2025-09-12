import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-purple-600 text-white",
    secondary: "bg-slate-700 text-slate-300",
    destructive: "bg-red-600 text-white",
    outline: "border border-slate-600 text-slate-300",
  }
  return <div className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-medium", variants[variant], className)} {...props} />
}


