"use client"

import * as React from "react"
import { OTPInput, SlotProps } from "input-otp"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  SlotProps & React.ComponentPropsWithoutRef<"div">
>(({ char, hasFakeCaret, isActive, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-12 w-12 text-center text-lg font-medium border border-white/30 rounded-lg bg-white/10 text-white transition-all duration-200",
      "focus-within:ring-2 focus-within:ring-cyan-400 focus-within:border-cyan-400",
      isActive && "ring-2 ring-cyan-400 border-cyan-400",
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-center w-full h-full">
      {char}
      {hasFakeCaret && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <div className="w-0.5 h-6 bg-cyan-400" />
        </div>
      )}
    </div>
  </div>
))
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
