import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex h-10 w-10 overflow-hidden rounded-full bg-slate-700", className)} {...props}>
      {children}
    </div>
  )
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
export function AvatarImage({ className, alt = "", ...props }: AvatarImageProps) {
  return <img className={cn("h-full w-full object-cover", className)} alt={alt} {...props} />
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}
export function AvatarFallback({ className, children, ...props }: AvatarFallbackProps) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center text-slate-200", className)} {...props}>
      {children}
    </div>
  )
}


