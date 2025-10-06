"use client"

import { useEffect, useState } from "react"
import { Video, Phone, MoreVertical, UserPlus, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Modal from "@/components/ui/modalIMG"

interface RightSidebarProps {
  selectedChat: string | null
  collapsed?: boolean
  onClose?: () => void
}

export function RightSidebar({ selectedChat, collapsed = false, onClose }: RightSidebarProps) {
  if (!selectedChat) {
    return null
  }

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [isImageOpen, setIsImageOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchUser(userId: string) {
      // Optimistically reset states for the new selection
      setIsLoading(true)
      setError(null)
      setUser(null)

      try {
        const res = await fetch(`http://localhost:4000/v1/users/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) {
          throw new Error(`Failed to load user (${res.status})`)
        }
        const data = await res.json()
        if (!isMounted) return
        const resolvedUser = (data?.data ?? data?.user ?? data) as any
        setUser(resolvedUser)
      } catch (e: any) {
        if (!isMounted) return
        setError(e?.message || "Unable to fetch user")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    if (selectedChat) {
      fetchUser(selectedChat)
    }

    return () => {
      isMounted = false
    }
  }, [selectedChat])

  return (
    <div className={"bg-slate-800/20 backdrop-blur-sm border-l border-slate-700/50 p-6 transition-all duration-300 relative " + (collapsed ? "w-0 px-0 overflow-hidden" : "w-80")}> 
      {!collapsed && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close profile"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
      
      <div className="text-center mb-6">
        <Avatar className="h-20 w-20 mx-auto mb-4 cursor-pointer" onClick={() => setIsImageOpen(true)}>
          <AvatarImage src={(user?.avatar || "/placeholder.svg")} alt={(user?.fullName || "User")} />
          <AvatarFallback className="bg-purple-600 text-white text-2xl">
            {(user?.fullName || "U")
              .toString()
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold text-white mb-1">
          {isLoading ? "Loading..." : ( user?.fullname || "Unknown User")}
        </h3>
        {!isLoading && (
          <p className="text-sm text-green-400 mb-2">Online</p>
        )}
        {/* {!isLoading && user?.title && (
          <Badge variant="secondary" className="bg-slate-700 text-slate-300">{user.title}</Badge>
        )}
        {!isLoading && !user?.title && (
          <Badge variant="secondary" className="bg-slate-700 text-slate-300">Member</Badge>
        )} */}
        {error && (
          <div className="mt-2 text-xs text-red-400">{error}</div>
        )}
      </div>

      {isImageOpen && (
        <Modal onClose={() => setIsImageOpen(false)}>
          <img
            src={user?.avatar || "/placeholder.svg"}
            alt={user?.fullName || "User"}
            className="w-[85vw] max-w-[520px] max-h-[65vh] object-contain rounded-md"
          />
        </Modal>
      )}

      {/* <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="bg-slate-900 border border-slate-700 shadow-xl w-full max-w-lg p-4">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsImageOpen(false)}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-black/70 text-white p-2 hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={(user?.avatar || "/placeholder.svg")}
              alt={(user?.fullName || "User")}
              className="w-[85vw] max-w-[520px] max-h-[65vh] object-contain rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog> */}

      <div className="space-y-3 mb-6">
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          <Video className="mr-2 h-4 w-4" />
          Start Video Call
        </Button>
        <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent">
          <Phone className="mr-2 h-4 w-4" />
          Voice Call
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">Contact Info</h4>
          <div className="space-y-2">
            <div className="text-sm text-slate-300"><span className="text-slate-400">Email:</span> {user?.email || "—"}</div>
            <div className="text-sm text-slate-300"><span className="text-slate-400">Phone:</span> {user?.phone || user?.phoneNumber || "—"}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">Shared Files</h4>
          <div className="text-sm text-slate-500">No shared files yet</div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">Actions</h4>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700/50">
              <UserPlus className="mr-2 h-4 w-4" />
              Add to Group
            </Button>
            <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-700/50">
              <MoreVertical className="mr-2 h-4 w-4" />
              More Options
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}