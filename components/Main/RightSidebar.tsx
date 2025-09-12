"use client"

import { Video, Phone, MoreVertical, UserPlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface RightSidebarProps {
  selectedChat: string | null
  collapsed?: boolean
  onClose?: () => void
}

export function RightSidebar({ selectedChat, collapsed = false, onClose }: RightSidebarProps) {
  if (!selectedChat) {
    return null
  }

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
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src="/placeholder.svg?key=sw1" alt="Sarah Wilson" />
          <AvatarFallback className="bg-purple-600 text-white text-2xl">SW</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold text-white mb-1">Sarah Wilson</h3>
        <p className="text-sm text-green-400 mb-2">Online</p>
        <Badge variant="secondary" className="bg-slate-700 text-slate-300">Product Designer</Badge>
      </div>

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
            <div className="text-sm text-slate-300"><span className="text-slate-400">Email:</span> sarah.wilson@company.com</div>
            <div className="text-sm text-slate-300"><span className="text-slate-400">Phone:</span> +1 (555) 123-4567</div>
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







