"use client"

import { ReactNode, useEffect } from "react"
import ReactDOM from "react-dom"

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
  // Ensure portal works only on client
  const modalRoot = typeof document !== "undefined" ? document.getElementById("modal-root") : null

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!modalRoot) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="relative bg-slate-700 rounded-sm shadow-xl border border-slate-500">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 rounded-sm px-[8px] bg-black/70 text-white hover:bg-black/80"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  )
}
