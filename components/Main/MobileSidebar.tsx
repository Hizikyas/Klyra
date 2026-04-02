"use client"

import { useEffect, useState } from "react"
import { Video, Users, Settings, X } from "lucide-react"
import { IoChatboxEllipsesSharp } from "react-icons/io5"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileSidebar({ isOpen, onClose, activeTab, onTabChange }: MobileSidebarProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const tabs = [
    { id: "chats", label: "Chats", icon: IoChatboxEllipsesSharp },
    { id: "groups", label: "Groups", icon: Users }, // Changed from "contacts" to "groups"
    { id: "video", label: "Video Calls", icon: Video },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("currentUser")
      setCurrentUser(raw ? JSON.parse(raw) : null)
    } catch {
      setCurrentUser(null)
    }
  }, [])

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    onClose()
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <div className={cn("fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50 z-50 transform transition-transform duration-300 lg:hidden", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                {currentUser?.avatar && currentUser?.avatar.trim() !== "" ? (
                  <AvatarImage src={currentUser.avatar} alt={currentUser?.fullname || currentUser?.username || "User"} />
                ) : (
                  <AvatarFallback className="bg-purple-600 text-white text-lg">
                    {currentUser?.username?.charAt(0) || currentUser?.fullname?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{currentUser?.fullname || currentUser?.username || "User"}</h3>
                <h3 className="text-gray-300 font-normal">@{currentUser?.username || "username"}</h3>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button key={tab.id} variant="ghost" className={cn("w-full justify-start text-left h-12 px-4 transition-all duration-200", activeTab === tab.id ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "text-slate-300 hover:text-white hover:bg-slate-700/50")} onClick={() => handleTabChange(tab.id)}>
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.label}
                  </Button>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-400 text-center">Klyra v1.0</div>
          </div>
        </div>
      </div>
    </>
  )
}