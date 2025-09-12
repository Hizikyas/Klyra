"use client"

import { useState } from "react"
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VideoCallModalProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  contactAvatar?: string
}

export function VideoCallModal({ isOpen, onClose, contactName, contactAvatar }: VideoCallModalProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callStatus] = useState<"connecting" | "connected" | "ended">("connecting")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-slate-900 border-slate-700 p-0">
        <div className="relative h-full flex flex-col">
          <DialogHeader className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">Video Call with {contactName}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 relative bg-slate-800">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={contactAvatar || "/placeholder.svg"} alt={contactName} />
                  <AvatarFallback className="bg-purple-600 text-white text-4xl">{contactName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <p className="text-white text-lg mb-2">Calling {contactName}...</p>
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 w-48 h-36 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center">
                  <VideoOff className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Camera off</p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Your video</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-4">
              <Button variant={isMuted ? "destructive" : "secondary"} size="lg" className="rounded-full w-12 h-12" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button variant={isVideoOff ? "destructive" : "secondary"} size="lg" className="rounded-full w-12 h-12" onClick={() => setIsVideoOff(!isVideoOff)}>
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              <Button variant="destructive" size="lg" className="rounded-full w-12 h-12" onClick={onClose}>
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}







