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
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black/10 backdrop-blur-sm">
      <div className="relative bg-transparent rounded-md shadow-xl border-4 border-black/90">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-5 rounded-full w-8 h-8 flex items-center justify-center bg-black/90 text-white hover:bg-black/80 z-10"
        >
          ✕
        </button>
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  )
}