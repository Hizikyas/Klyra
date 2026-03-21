"use client"

import { useEffect, useState } from "react"
import { Video, Phone, MoreVertical, UserPlus, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const [sharedFiles, setSharedFiles] = useState<any[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  const openCallLink = (url: string) => {
    const opened = window.open(url, "_blank")
    if (!opened) {
      window.location.href = url
    }
    return opened
  }

  const sendCallEventMessage = async (
    mode: "audio" | "video",
    event: "started" | "ended",
    durationSeconds?: number
  ) => {
    if (!selectedChat) return
    const token = sessionStorage.getItem("authToken")
    if (!token) return

    const callLabel = mode === "audio" ? "Audio call" : "Video call"
    const durationText =
      event === "ended" && typeof durationSeconds === "number"
        ? ` (duration: ${Math.max(1, durationSeconds)}s)`
        : ""
    const content = `${callLabel} ${event}${durationText}`

    const formData = new FormData()
    formData.append("content", content)
    formData.append("recipientId", selectedChat)

    try {
      await fetch("http://localhost:4000/v1/messages", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
    } catch {
      // best effort
    }
  }

  const startDirectCall = (mode: "audio" | "video") => {
    if (!selectedChat) return
    const rawCurrentUser = sessionStorage.getItem("currentUser")
    const currentUser = rawCurrentUser ? JSON.parse(rawCurrentUser) : null
    if (!currentUser?.id) return

    const roomId = ["klyra", ...[String(currentUser.id), String(selectedChat)].sort()].join("-")
    const url =
      mode === "audio"
        ? `https://talky.io/${roomId}?audio=1`
        : `https://talky.io/${roomId}`

    const startedAt = Date.now()
    const popup = openCallLink(url)
    void sendCallEventMessage(mode, "started")

    if (!popup) return
    const poll = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(poll)
        const seconds = Math.round((Date.now() - startedAt) / 1000)
        void sendCallEventMessage(mode, "ended", seconds)
      }
    }, 1500)
  }

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

  useEffect(() => {
    if (!selectedChat) return

    let isMounted = true
    async function fetchSharedFiles(recipientId: string) {
      setLoadingFiles(true)
      try {
        const token = sessionStorage.getItem("authToken")
        if (!token) return
        const res = await fetch(`http://localhost:4000/v1/messages?recipientId=${recipientId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        if (!res.ok) return
        const data = await res.json()
        if (!isMounted) return
        const mediaOnly = (data?.messages || []).filter((m: any) => !!m.mediaUrl)
        setSharedFiles(mediaOnly)
      } finally {
        if (isMounted) setLoadingFiles(false)
      }
    }

    fetchSharedFiles(selectedChat)
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

        {error && (
          <div className="mt-2 text-xs text-red-400">{error}</div>
        )}
      </div>

      {isImageOpen && (
        <Modal onClose={() => setIsImageOpen(false)}>
          <img
            src={user?.avatar || "/placeholder.svg"}
            alt={user?.fullName || "User"}
            className="w-full max-w-[40vw] max-h-[40vh] object-contain rounded-md"
          />
        </Modal>
      )}

      <div className="space-y-3 mb-6">
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => startDirectCall("video")}>
          <Video className="mr-2 h-4 w-4" />
          Start Video Call
        </Button>
        <Button
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
          onClick={() => startDirectCall("audio")}
        >
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
          {loadingFiles ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : sharedFiles.length === 0 ? (
            <div className="text-sm text-slate-500">No shared files yet</div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {sharedFiles.slice(-20).reverse().map((file) => (
                <button
                  key={file.id}
                  className="w-full text-left p-2 rounded-md bg-slate-700/40 hover:bg-slate-700/60 transition"
                  onClick={() => window.open(file.mediaUrl, "_blank")}
                >
                  {file.mediaType?.startsWith("image/") ? (
                    <img src={file.mediaUrl} alt="shared" className="h-24 w-full object-cover rounded mb-1" />
                  ) : null}
                  <p className="text-xs text-slate-300 truncate">
                    {(() => {
                      try {
                        const parsed = new URL(file.mediaUrl)
                        const named = parsed.searchParams.get("name")
                        if (named) return decodeURIComponent(named)
                        return decodeURIComponent(parsed.pathname.split("/").pop() || "File")
                      } catch {
                        return "File"
                      }
                    })()}
                  </p>
                </button>
              ))}
            </div>
          )}
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