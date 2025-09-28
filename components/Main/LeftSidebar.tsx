"use client"

import { Video, Users, Settings, Circle } from "lucide-react"
import { IoChatboxEllipsesSharp } from "react-icons/io5"
import React , { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface LeftSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function LeftSidebar({ activeTab, onTabChange }: LeftSidebarProps) {
  const currentUser = sessionStorage.getItem("currentUser") ? JSON.parse(sessionStorage.getItem("currentUser")!) : null
  const [collapsed, setCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const tabs = [
    { id: "chats", label: "Chats", icon: IoChatboxEllipsesSharp },
    { id: "video", label: "Video Calls", icon: Video },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const showLabels = !collapsed || isHovered

  return (
    <div 
      className={cn("bg-slate-800/30 backdrop-blur-sm border-r border-slate-700/50 flex flex-col transition-all duration-300", showLabels ? "w-80" : "w-20")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    > 
      <div className="p-6 border-b border-slate-700/50">
        <div className={cn("flex items-center", showLabels ? "space-x-3" : "justify-center")}> 
          <div className="relative">
             <Avatar className={cn("h-12 w-12", !showLabels && "h-10 w-10")}>
               {currentUser?.avatar ? (
                 <AvatarImage src={currentUser?.avatar} alt={currentUser?.fullname || 'User'} />
               ) : (
                 <AvatarFallback className="bg-purple-600 text-white text-lg">
                   {currentUser?.username?.charAt(0) || currentUser?.fullname?.charAt(0) || 'U'}
                 </AvatarFallback>
               )}
             </Avatar>
            <div className="absolute bottom-0 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
          </div>
          {showLabels && (
            <div className="flex-1">
              <h3 title="Full name" className="text-white font-semibold">{currentUser?.fullname}</h3>
              <h3 title="username" className="text-gray-300 font-normal">@{currentUser?.username}</h3>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button key={tab.id} variant="ghost" className={cn("w-full h-12 px-4 transition-all duration-200", activeTab === tab.id ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "text-slate-300 hover:text-white hover:bg-slate-700/50", showLabels ? "justify-start text-left" : "justify-center") } onClick={() => onTabChange(tab.id)}>
                <Icon className={cn("h-5 w-5", showLabels && "mr-3")} />
                {showLabels && tab.label}
              </Button>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <div className="text-xs text-slate-400 text-center">Klyra v1.0 • MVP</div>
      </div>
    </div>
  )
}







