"use client"

import { useState } from "react"
import { Send, Paperclip, Smile, Video, Phone, MessageCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ChatSectionProps {
  activeTab: string
  selectedChat: string | null
  onChatSelect: (chatId: string) => void
  isMobile?: boolean
  onToggleRightPanel?: () => void
}

const mockChats = [
  { id: "1", name: "Sarah Wilson", lastMessage: "Hey! How are you doing?", timestamp: "2m ago", unread: 2, avatar: "/placeholder.svg?key=sw1", online: true },
  { id: "2", name: "Team Alpha", lastMessage: "Meeting at 3 PM today", timestamp: "15m ago", unread: 0, avatar: "/placeholder.svg?key=ta1", online: false, isGroup: true },
  { id: "3", name: "Mike Johnson", lastMessage: "Thanks for the help!", timestamp: "1h ago", unread: 0, avatar: "/placeholder.svg?key=mj1", online: true },
  { id: "4", name: "Design Team", lastMessage: "New mockups are ready", timestamp: "2h ago", unread: 5, avatar: "/placeholder.svg?key=dt1", online: false, isGroup: true },
]

const mockMessages = [
  { id: "1", sender: "Sarah Wilson", content: "Hey! How are you doing?", timestamp: "2:30 PM", isOwn: false },
  { id: "2", sender: "You", content: "I'm doing great! Just working on the new project.", timestamp: "2:32 PM", isOwn: true },
  { id: "3", sender: "Sarah Wilson", content: "That sounds exciting! Can you tell me more about it?", timestamp: "2:33 PM", isOwn: false },
  { id: "4", sender: "You", content: "It's a messaging app with video calls. Really modern design!", timestamp: "2:35 PM", isOwn: true },
]

export function ChatSection({ activeTab, selectedChat, onChatSelect, isMobile = false, onToggleRightPanel }: ChatSectionProps) {
  const [message, setMessage] = useState("")

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("")
    }
  }

  const handleBackToList = () => {
    onChatSelect("")
  }

  if (activeTab !== "chats") {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900/20">
        <div className="text-center text-slate-400">
          <div className="text-6xl mb-4">
            {activeTab === "video" && "📹"}
            {activeTab === "contacts" && "👥"}
            {activeTab === "settings" && "⚙️"}
          </div>
          <h3 className="text-xl font-semibold mb-2 capitalize">{activeTab}</h3>
          <p>This feature is coming soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex">
      <div className={cn("w-80 bg-slate-800/20 backdrop-blur-sm border-r border-slate-700/50 relative z-10", isMobile ? (selectedChat ? "hidden" : "w-full") : "w-80")}>
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2">
            {mockChats.map((chat) => (
              <div key={chat.id} className={cn("p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1", selectedChat === chat.id ? "bg-purple-600/20 border border-purple-500/30" : "hover:bg-slate-700/30")} onClick={() => onChatSelect(chat.id)}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                      <AvatarFallback className="bg-purple-600 text-white">{chat.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium truncate">{chat.name}</h4>
                      <span className="text-xs text-slate-400">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400 truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className={cn("flex-1 flex flex-col bg-slate-900/10", isMobile ? (selectedChat ? "w-full" : "hidden") : "flex-1")}>
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <button type="button" onClick={onToggleRightPanel} className="flex items-center space-x-3 group">
                  {isMobile && (
                    <Button variant="ghost" size="icon" onClick={handleBackToList} className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg?key=sw1" alt="Sarah Wilson" />
                    <AvatarFallback className="bg-purple-600 text-white">SW</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold">Sarah Wilson</h3>
                    <p className="text-sm text-green-400">Online</p>
                  </div>
                </button>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                    <Video className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mockMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-xs lg:max-w-md px-4 py-2 rounded-2xl", msg.isOwn ? "bg-purple-600 text-white" : "bg-slate-700 text-white")}> 
                      <p className="text-sm">{msg.content}</p>
                      <p className={cn("text-xs mt-1", msg.isOwn ? "text-purple-200" : "text-slate-400")}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700/50">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} placeholder="Type a message..." className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 pr-12" onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSendMessage()} />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-500" />
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p>Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}







