"use client"

import { Search, Bell, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopNavigationProps {
  onMobileSidebarToggle?: () => void
  onSettingsClick?: () => void
}

export function TopNavigation({ onMobileSidebarToggle, onSettingsClick }: TopNavigationProps) {
  const currentUser = sessionStorage.getItem("currentUser") ? JSON.parse(sessionStorage.getItem("currentUser")!) : null
  console.log("TopNavigation currentUser:", currentUser) // Debug log
  return (
    <header className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-4 lg:px-6 flex items-center justify-between relative z-50">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700/50"
          onClick={onMobileSidebarToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="text-2xl font-bold text-white">Klyra</div>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search contacts or chats..."
            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-white hover:bg-slate-700/50">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              
                <Avatar className="h-8 w-8">
                  {currentUser?.avatar && currentUser?.avatar.trim() !== "" ? (
                    <AvatarImage
                      src={currentUser.avatar}
                      alt={currentUser?.fullname || currentUser?.username || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-purple-600 text-white">
                    {currentUser?.username?.charAt(0) ||
                      currentUser?.fullname?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                  )}
                  
                </Avatar>
              
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 z-[60]" align="end">
              <DropdownMenuItem 
                className="text-slate-300 hover:text-white hover:bg-slate-700" 
                onClick={onSettingsClick}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}







