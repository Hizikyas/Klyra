"use client"

import { User, Edit3, Shield, Bell, Palette, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SettingsSidebarProps {
  selectedSetting: string | null
  onSettingSelect: (setting: string) => void
  isMobile?: boolean
}

const settingsOptions = [
  { id: "profile", label: "View Profile", icon: User, description: "View and manage your profile" },
  { id: "edit-profile", label: "Edit Profile", icon: Edit3, description: "Update your personal information" },
  { id: "privacy", label: "Privacy & Security", icon: Shield, description: "Manage your privacy settings" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Configure notification preferences" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Customize the app's look and feel" },
  { id: "help", label: "Help & Support", icon: HelpCircle, description: "Get help and contact support" },
  { id: "logout", label: "Log Out", icon: LogOut, description: "Sign out of your account" },
]

export function SettingsSidebar({ selectedSetting, onSettingSelect, isMobile = false }: SettingsSidebarProps) {
  return (
    <div className={cn("w-80 bg-slate-800/20 backdrop-blur-sm border-r border-slate-700/50 relative z-10", isMobile ? "w-full" : "w-80")}>
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-sm text-slate-400">Manage your account and preferences</p>
      </div>
      
      <div className="p-2">
        {settingsOptions.map((option) => {
          const Icon = option.icon
          return (
            <div 
              key={option.id} 
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 group",
                selectedSetting === option.id 
                  ? "bg-purple-600/20 border border-purple-500/30" 
                  : "hover:bg-slate-700/30"
              )} 
              onClick={() => onSettingSelect(option.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  selectedSetting === option.id 
                    ? "bg-purple-600/30 text-purple-300" 
                    : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-slate-300"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm">{option.label}</h4>
                  <p className="text-xs text-slate-400 truncate">{option.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
