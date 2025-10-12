"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Paperclip, Smile, Video, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsContent } from "./SettingsContent";
import { useSocket } from "../../hooks/useSocket"; 

interface ChatSectionProps {
  activeTab: string;
  selectedChat: string | null;
  onChatSelect: (chatId: string) => void;
  isMobile?: boolean;
  onToggleRightPanel?: () => void;
  selectedSetting: string | null;
  onSettingSelect: (setting: string) => void;
}

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  online: boolean;
  isGroup?: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export function ChatSection({
  activeTab,
  selectedChat,
  onChatSelect,
  isMobile = false,
  onToggleRightPanel,
  selectedSetting,
  onSettingSelect,
}: ChatSectionProps) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const { socket, isConnected } = useSocket(currentUser?.id, selectedChat?.includes("group:") ? selectedChat.replace("group:", "") : null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch initial chats (replace mock data with API call if needed)
  useEffect(() => {
    // Simulate fetching chats from backend (replace with real API call)
    setChats([
      { id: "1", name: "Sarah Wilson", lastMessage: "", timestamp: "", unread: 0, avatar: "/placeholder.svg?key=sw1", online: true },
      { id: "2", name: "Team Alpha", lastMessage: "", timestamp: "", unread: 0, avatar: "/placeholder.svg?key=ta1", online: false, isGroup: true },
    ]);
  }, []);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      setMessages((prev) => [...prev, {
        id: newMessage.id,
        sender: newMessage.senderId === currentUser.id ? "You" : newMessage.sender?.username || "Unknown",
        content: newMessage.content || newMessage.mediaUrl || "Media",
        timestamp: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: newMessage.senderId === currentUser.id,
      }]);
      scrollToBottom();
    };

    const handleMessageUpdated = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, content: updatedMessage.content || msg.content, isRead: updatedMessage.isRead } : msg
        )
      );
    };

    const handleMessageDeleted = (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageUpdated", handleMessageUpdated);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, currentUser.id]);

  // Scroll to bottom when new message arrives
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const handleSendMessage = () => {
    if (!socket || !message.trim() || !selectedChat) return;

    const payload = {
      content: message,
      senderId: currentUser.id,
      recipientId: selectedChat.includes("group:") ? null : selectedChat,
      groupId: selectedChat.includes("group:") ? selectedChat.replace("group:", "") : null,
    };

    socket.emit("sendMessage", payload); // Emit to backend
    setMessage("");
  };

  const handleBackToList = () => {
    onChatSelect("");
  };

  if (activeTab === "settings") {
    return (
      <div className="flex-1 flex">
        <SettingsSidebar
          selectedSetting={selectedSetting}
          onSettingSelect={onSettingSelect}
          isMobile={isMobile}
        />
        <SettingsContent selectedSetting={selectedSetting} isMobile={isMobile} />
      </div>
    );
  }

  if (activeTab !== "chats") {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900/20">
        <div className="text-center text-slate-400">
          <div className="text-6xl mb-4">
            {activeTab === "video" && "📹"}
            {activeTab === "contacts" && "👥"}
          </div>
          <h3 className="text-xl font-semibold mb-2 capitalize">{activeTab}</h3>
          <p>This feature is coming soon!</p>
        </div>
      </div>
    );
  }

  const selectedChatObj = chats.find((c) => c.id === selectedChat);

  return (
    <div className="flex-1 flex">
      <div
        className={cn(
          "w-80 bg-slate-800/20 backdrop-blur-sm border-r border-slate-700/50 relative z-10",
          isMobile ? (selectedChat ? "hidden" : "w-full") : "w-80"
        )}
      >
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1",
                  selectedChat === chat.id
                    ? "bg-purple-600/20 border border-purple-500/30"
                    : "hover:bg-slate-700/30"
                )}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {chat.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium leading-tight truncate">{chat.name}</h4>
                      <span className="text-xs text-slate-400">{chat.timestamp}</span>
                    </div>
                    {chat.lastMessage && (
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-sm text-slate-400 truncate">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col bg-slate-900/10",
          isMobile ? (selectedChat ? "w-full" : "hidden") : "flex-1"
        )}
      >
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onToggleRightPanel}
                  className="flex items-center space-x-3 group"
                >
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToList}
                      className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedChatObj?.avatar || "/placeholder.svg"}
                      alt={selectedChatObj?.name || "Chat"}
                    />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {(selectedChatObj?.name || "").split(" ").map((n) => n[0]).join("") || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold">{selectedChatObj?.name || "Conversation"}</h3>
                    <p className="text-sm text-green-400">Online</p>
                  </div>
                </button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                        msg.isOwn ? "bg-purple-600 text-white" : "bg-slate-700 text-white"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          msg.isOwn ? "text-purple-200" : "text-slate-400"
                        )}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 pr-12"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
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
              <img
                src="/icons/chatting_interface.svg"
                alt="No conversation selected"
                className="h-32 w-32 mx-auto mb-4 opacity-50"
              />
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p>Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}