"use client"

import { MessageCircle, Video, Users, Settings, Circle, X } from "lucide-react"
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
  const tabs = [
    { id: "chats", label: "Chats", icon: MessageCircle },
    { id: "video", label: "Video Calls", icon: Video },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

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
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg?key=gw0b4" alt="John Doe" />
                  <AvatarFallback className="bg-purple-600 text-white text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">John Doe</h3>
                <div className="flex items-center space-x-1 text-sm text-green-400">
                  <Circle className="h-2 w-2 fill-current" />
                  <span>Online</span>
                </div>
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
            <div className="text-xs text-slate-400 text-center">Klyra v1.0 • MVP</div>
          </div>
        </div>
      </div>
    </>
  )
}







