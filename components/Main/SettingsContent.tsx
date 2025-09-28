"use client"

import { User, Edit3, Shield, Bell, Palette, HelpCircle, LogOut, Mail, Phone, MapPin, Calendar, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SettingsContentProps {
  selectedSetting: string | null
  isMobile?: boolean
}

export function SettingsContent({ selectedSetting, isMobile = false }: SettingsContentProps) {
  const currentUser = sessionStorage.getItem("currentUser") ? JSON.parse(sessionStorage.getItem("currentUser")!) : null

  const renderProfileView = () => (
    <div className="p-6 overflow-y-auto h-full">
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            {currentUser?.avatar && currentUser?.avatar.trim() !== "" ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser?.fullname || currentUser?.username || "User"} />
            ) : (
              <AvatarFallback className="bg-purple-600 text-white text-2xl">
                {currentUser?.username?.charAt(0) || currentUser?.fullname?.charAt(0) || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{currentUser?.fullname || currentUser?.username || "User"}</h2>
        <p className="text-slate-400 mb-4">@{currentUser?.username || "username"}</p>
        <Badge variant="secondary" className="bg-green-600 text-white">Online</Badge>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">{currentUser?.email || "user@example.com"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">New York, NY</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300">Member since January 2024</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Bio</h3>
          <p className="text-slate-300">
            {currentUser?.bio || "No bio available. Click 'Edit Profile' to add a bio."}
          </p>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">24</div>
              <div className="text-sm text-slate-400">Friends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">156</div>
              <div className="text-sm text-slate-400">Messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEditProfile = () => (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Edit3 className="mr-2 h-6 w-6" />
        Edit Profile
      </h2>

      <div className="space-y-6">
        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {currentUser?.avatar && currentUser?.avatar.trim() !== "" ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser?.fullname || currentUser?.username || "User"} />
              ) : (
                <AvatarFallback className="bg-purple-600 text-white text-xl">
                  {currentUser?.username?.charAt(0) || currentUser?.fullname?.charAt(0) || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <Input 
                defaultValue={currentUser?.fullname || ""} 
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <Input 
                defaultValue={currentUser?.username || ""} 
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input 
                defaultValue={currentUser?.email || ""} 
                type="email"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <Input 
                defaultValue="+1 (555) 123-4567" 
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea 
                className="w-full h-24 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-purple-400 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
                defaultValue={currentUser?.bio || ""}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
            Cancel
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Shield className="mr-2 h-6 w-6" />
        Privacy & Security
      </h2>
      <div className="text-center text-slate-400">
        <Shield className="h-16 w-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold mb-2">Privacy Settings</h3>
        <p>Configure your privacy and security preferences here.</p>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Bell className="mr-2 h-6 w-6" />
        Notifications
      </h2>
      <div className="text-center text-slate-400">
        <Bell className="h-16 w-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold mb-2">Notification Settings</h3>
        <p>Manage your notification preferences here.</p>
      </div>
    </div>
  )

  const renderAppearance = () => (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Palette className="mr-2 h-6 w-6" />
        Appearance
      </h2>
      <div className="text-center text-slate-400">
        <Palette className="h-16 w-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold mb-2">Appearance Settings</h3>
        <p>Customize the app's look and feel here.</p>
      </div>
    </div>
  )

  const renderHelp = () => (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <HelpCircle className="mr-2 h-6 w-6" />
        Help & Support
      </h2>
      <div className="text-center text-slate-400">
        <HelpCircle className="h-16 w-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold mb-2">Get Help</h3>
        <p>Find answers to common questions and contact support.</p>
      </div>
    </div>
  )

  const renderLogout = () => (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <LogOut className="mr-2 h-6 w-6" />
        Log Out
      </h2>
      <div className="text-center text-slate-400">
        <LogOut className="h-16 w-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold mb-2">Sign Out</h3>
        <p>Are you sure you want to log out?</p>
        <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (selectedSetting) {
      case "profile":
        return renderProfileView()
      case "edit-profile":
        return renderEditProfile()
      case "privacy":
        return renderPrivacySettings()
      case "notifications":
        return renderNotifications()
      case "appearance":
        return renderAppearance()
      case "help":
        return renderHelp()
      case "logout":
        return renderLogout()
      default:
        return renderProfileView()
    }
  }

  return (
    <div className={cn("flex-1 flex flex-col bg-slate-900/10", isMobile ? "w-full" : "flex-1")}>
      {renderContent()}
    </div>
  )
}
