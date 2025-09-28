"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(DropdownContext)!
  const child = React.Children.only(children as React.ReactElement)
  const props = {
    onClick: () => ctx.setOpen(!ctx.open),
  }
  return asChild ? React.cloneElement(child as any, props) : <button {...props}>{children}</button>
}

export function DropdownMenuContent({ className, align = "end", forceMount, children }: { className?: string; align?: "start" | "end"; forceMount?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(DropdownContext)!
  if (!ctx.open && !forceMount) return null
  return (
    <div className={cn("absolute z-50 mt-2 min-w-[10rem] rounded-md border bg-slate-800 p-1 text-slate-200 shadow-md", align === "end" ? "right-0" : "left-0", className)}>
      {children}
    </div>
  )
}

export function DropdownMenuItem({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) {
  const ctx = React.useContext(DropdownContext)!
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    ctx.setOpen(false)
  }
  
  return <div className={cn("flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm hover:bg-slate-700", className)} onClick={handleClick}>{children}</div>
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-slate-700", className)} />
}


