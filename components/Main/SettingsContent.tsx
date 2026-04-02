"use client"

import { useState, useEffect } from "react"
import { User, Edit3,  Palette, LogOut, Mail, Phone, MapPin, Calendar, Camera } from "lucide-react"
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
  const [currentUser, setCurrentUser] = useState<any>(null)

  const backgrounds = [
    { id: "default", name: "Default (None)", src: "" },
    { id: "blue", name: "Blue Gradient", src: "/background/blue-gradiant.jpg" },
    { id: "doodle", name: "Hand Drawn Doodle", src: "/background/hand-drawn-doodle.jpg" },
    { id: "tech", name: "Modern Tech", src: "/background/modern-tech-background.jpg" },
  ];
  
  const [selectedBg, setSelectedBg] = useState("");
  const [profileData, setProfileData] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    bio: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ friends: 0, messages: 0 });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("currentUser")
      const parsed = raw ? JSON.parse(raw) : null
      setCurrentUser(parsed)
      setProfileData({
        fullname: parsed?.fullname || "",
        username: parsed?.username || "",
        email: parsed?.email || "",
        phone: parsed?.phone || "",
        bio: parsed?.bio || ""
      })
    } catch {
      setCurrentUser(null)
      setProfileData({
        fullname: "",
        username: "",
        email: "",
        phone: "",
        bio: ""
      })
    }
  }, [])

  useEffect(() => {
    setSelectedBg(localStorage.getItem("chatBg") || "");
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.id) return;
      try {
        const token = sessionStorage.getItem('authToken');
        const res = await fetch(`https://klyra-back.onrender.com/v1/users/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setStats({
              friends: data.user.friendsCount || 0,
              messages: data.user.messagesCount || 0
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch user stats", e);
      }
    };
    fetchStats();
  }, [currentUser?.id]);

  const handleBgChange = (src: string) => {
    setSelectedBg(src);
    if (src) {
      localStorage.setItem("chatBg", src);
    } else {
      localStorage.removeItem("chatBg");
    }
    window.dispatchEvent(new Event("chatBgChanged"));
  };

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return;
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem('authToken');
      const res = await fetch(`https://klyra-back.onrender.com/v1/users/${currentUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          sessionStorage.setItem("currentUser", JSON.stringify(data.user));
          window.dispatchEvent(new Event("profileUpdated"));
          alert("Profile updated successfully!");
        }
      } else {
        alert("Failed to update profile.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

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
              <div className="text-2xl font-bold text-purple-400">{stats.friends}</div>
              <div className="text-sm text-slate-400">Friends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.messages}</div>
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
                value={profileData.fullname} 
                onChange={(e) => setProfileData({...profileData, fullname: e.target.value})}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <Input 
                value={profileData.username} 
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <Input 
                value={profileData.email} 
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                type="email"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <Input 
                value={profileData.phone} 
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea 
                className="w-full h-24 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:border-purple-400 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50" onClick={() => {
            setProfileData({
              fullname: currentUser?.fullname || "",
              username: currentUser?.username || "",
              email: currentUser?.email || "",
              phone: currentUser?.phone || "",
              bio: currentUser?.bio || ""
            });
          }}>
            Cancel
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAppearance = () => (
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Palette className="mr-2 h-6 w-6" />
        Appearance
      </h2>
      <div className="text-center text-slate-400 mb-8">
        <Palette className="h-16 w-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-semibold mb-2">Appearance Settings</h3>
        <p>Customize the chat background image.</p>
      </div>

      <div className="bg-slate-800/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chat Background</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {backgrounds.map((bg) => (
            <div 
              key={bg.id} 
              className={cn("cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200", selectedBg === bg.src ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "border-slate-700 hover:border-slate-500")}
              onClick={() => handleBgChange(bg.src)}
            >
              {bg.src ? (
                 <img src={bg.src} alt={bg.name} className="w-full h-32 object-cover" />
              ) : (
                 <div className="w-full h-32 bg-slate-900 flex items-center justify-center text-slate-500">Default Theme</div>
              )}
              <div className={cn("p-2 text-center text-sm font-medium", selectedBg === bg.src ? "bg-purple-600/20 text-purple-300" : "bg-slate-800 text-slate-300")}>{bg.name}</div>
            </div>
          ))}
        </div>
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
        <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
          sessionStorage.clear();
          localStorage.removeItem("authToken");
          window.location.href = "/";
        }}>
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
      case "appearance":
        return renderAppearance()
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
