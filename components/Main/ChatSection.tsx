"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Paperclip, Smile, Video, Phone, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsContent } from "./SettingsContent";

interface ChatSectionProps {
  activeTab: string;
  selectedChat: string | null;
  onChatSelect: (chatId: string) => void;
  isMobile?: boolean;
  onToggleRightPanel?: () => void;
  selectedSetting: string | null;
  onSettingSelect: (setting: string) => void;
  socket: any; // Type this properly if possible
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
  createdAt: string; // Store raw date string for grouping
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
  socket,
}: ChatSectionProps) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false); // New state for loading indicator
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to format timestamp consistently (parse as UTC if no TZ, display in fixed UTC with 12-hour AM/PM)
  const formatTimestamp = (dateStr?: string | Date, includeDate: boolean = false): string => {
    let dateInput = dateStr;
    if (!dateInput) {
      dateInput = new Date();
    }
    let dateString = typeof dateInput === 'string' ? dateInput : dateInput.toISOString();
    // Append 'Z' if no timezone indicator (assume UTC)
    if (!dateString.endsWith('Z') && !/[\+\-]\d{2}:\d{2}$/.test(dateString)) {
      dateString += 'Z';
    }
    const date = new Date(dateString);
    if (includeDate) {
      return date.toLocaleDateString('en-US', {
        month: 'short', // Use short month names (e.g., "Oct" instead of "October")
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  };

  // Group messages by date for rendering headers
  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    let currentGroup: Message[] = [];

    messages.forEach((msg) => {
      const msgDate = formatTimestamp(msg.createdAt, true);
      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          grouped.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = msgDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      grouped.push({ date: currentDate, messages: currentGroup });
    }

    return grouped;
  };

  // Ensure a chat item exists/updated and moved to top
  const upsertChatPreview = (
    chatId: string,
    opts: {
      name?: string;
      avatar?: string;
      lastMessage?: string;
      timestamp?: string;
      incrementUnread?: boolean;
      resetUnread?: boolean;
    } = {}
  ) => {
    setChats((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === chatId);
      const timestamp = opts.timestamp ?? formatTimestamp();
      if (existingIndex !== -1) {
        const existing = prev[existingIndex];
        const updated: ChatItem = {
          ...existing,
          name: opts.name ?? existing.name,
          avatar: opts.avatar ?? existing.avatar,
          lastMessage: opts.lastMessage ?? existing.lastMessage,
          timestamp,
          unread: opts.resetUnread
            ? 0
            : opts.incrementUnread
            ? (existing.unread || 0) + 1
            : existing.unread,
        };
        const next = [updated, ...prev.slice(0, existingIndex), ...prev.slice(existingIndex + 1)];
        return next;
      }
      const created: ChatItem = {
        id: chatId,
        name: opts.name || 'User',
        lastMessage: opts.lastMessage || '',
        timestamp,
        unread: opts.resetUnread ? 0 : opts.incrementUnread ? 1 : 0,
        avatar: opts.avatar,
        online: false,
      };
      return [created, ...prev];
    });
  };

  // Load conversations from API and hydrate from sessionStorage
  useEffect(() => {
    const loadConversations = async () => {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
      if (!token) return;

      try {
        // First try to load from sessionStorage for quick display
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('recentChats') : null;
        if (stored) {
          const parsed = JSON.parse(stored) as ChatItem[];
          if (Array.isArray(parsed)) setChats(parsed);
        }

        // Then fetch fresh data from API
        const res = await fetch('http://localhost:4000/v1/messages/conversations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.conversations)) {
            const mappedChats: ChatItem[] = data.conversations.map((conv: any) => ({
              id: conv.participantId,
              name: conv.participant?.username || 'User',
              lastMessage: conv.lastMessage?.content || '',
              timestamp: conv.lastMessage?.createdAt 
                ? formatTimestamp(conv.lastMessage.createdAt)
                : '',
              unread: conv.unreadCount || 0,
              avatar: conv.participant?.avatar,
              online: false,
            }));
            setChats(mappedChats);
          }
        }
      } catch (e) {
        console.error('Failed to load conversations', e);
        // Fallback to sessionStorage if API fails
        try {
          const stored = typeof window !== 'undefined' ? sessionStorage.getItem('recentChats') : null;
          if (stored) {
            const parsed = JSON.parse(stored) as ChatItem[];
            if (Array.isArray(parsed)) setChats(parsed);
          }
        } catch (storageError) {
          // ignore
        }
      }
    };

    loadConversations();
  }, []);

  // Persist chats to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem('recentChats', JSON.stringify(chats));
    } catch (e) {
      // ignore
    }
  }, [chats]);

  // Listen to search selection to add/select chat
  useEffect(() => {
    const onAddChatFromSearch = (e: Event) => {
      const custom = e as CustomEvent;
      const u = custom.detail || {};
      if (!u?.id) return;
      setChats((prev) => {
        const exists = prev.some((c) => c.id === u.id);
        const next = exists
          ? prev
          : [
              {
                id: u.id,
                name: u.username || 'User',
                lastMessage: u.lastMessage?.content || '',
                timestamp: '',
                unread: 0,
                avatar: u.avatar || undefined,
                online: false,
              },
              ...prev,
            ];
        return next;
      });
      onChatSelect(u.id);
    };
    window.addEventListener('klyra:addChatFromSearch', onAddChatFromSearch as EventListener);
    return () => window.removeEventListener('klyra:addChatFromSearch', onAddChatFromSearch as EventListener);
  }, [onChatSelect]);

  // Load messages for selected chat with caching
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    if (!token || !selectedChat) return;

    if (!messagesCache[selectedChat]) {
      setLoading(true); // Start loading when fetching new messages
    }

    const fetchMessages = async () => {
      try {
        const url = new URL('http://localhost:4000/v1/messages');
        url.searchParams.set('recipientId', selectedChat);
        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        const data = await res.json();
        if (Array.isArray(data?.messages)) {
          const mapped: Message[] = data.messages.map((m: any) => ({
            id: m.id,
            sender: m.senderId === currentUser.id ? 'You' : m.sender?.username || 'User',
            content: m.content || m.mediaUrl || 'Media',
            timestamp: formatTimestamp(m.createdAt),
            createdAt: m.createdAt, // Store raw date for grouping
            isOwn: m.senderId === currentUser.id,
          }));
          
          // Cache the messages
          setMessagesCache(prev => ({ ...prev, [selectedChat]: mapped }));
          setMessages(mapped);
          setTimeout(() => scrollToBottom(), 100);

          // Update chat preview (last message and timestamp) - only if we have messages
          const last = mapped[mapped.length - 1];
          if (last) {
            upsertChatPreview(selectedChat, {
              name: data?.recipient?.username || selectedChatObj?.name,
              avatar: data?.recipient?.avatar || selectedChatObj?.avatar,
              lastMessage: last.content,
              timestamp: last.timestamp,
              resetUnread: true,
            });
          }
        }
      } catch (e) {
        console.error('Failed to load messages', e);
      } finally {
        setLoading(false); // Stop loading after fetch completes
      }
    };

    fetchMessages();
  }, [selectedChat, currentUser.id, messagesCache]);

  // Reset unread count when opening a chat
  useEffect(() => {
    if (!selectedChat) return;
    upsertChatPreview(selectedChat, { resetUnread: true });
  }, [selectedChat]);

  // Handle incoming messages (filter for current chat)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      const isForThisChat =
        (!!newMessage.recipientId && newMessage.recipientId === currentUser.id && newMessage.senderId === selectedChat) ||
        (!!newMessage.recipientId && newMessage.senderId === currentUser.id && newMessage.recipientId === selectedChat);

      if (!selectedChat || !isForThisChat) return;

      const newMessageObj = {
        id: newMessage.id,
        sender: newMessage.senderId === currentUser.id ? 'You' : newMessage.sender?.username || 'Unknown',
        content: newMessage.content || newMessage.mediaUrl || 'Media',
        timestamp: formatTimestamp(newMessage.createdAt),
        createdAt: newMessage.createdAt,
        isOwn: newMessage.senderId === currentUser.id,
      };

      setMessages((prev) => [...prev, newMessageObj]);
      
      // Update cache for current chat
      setMessagesCache((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMessageObj]
      }));
      
      setTimeout(() => scrollToBottom(), 100);

      // Update chat preview for the other participant
      const otherUserId = newMessage.senderId === currentUser.id ? newMessage.recipientId : newMessage.senderId;
      const otherUserName = newMessage.senderId === currentUser.id ? newMessage.recipient?.username : newMessage.sender?.username;
      const otherUserAvatar = newMessage.senderId === currentUser.id ? newMessage.recipient?.avatar : newMessage.sender?.avatar;
      upsertChatPreview(otherUserId, {
        name: otherUserName,
        avatar: otherUserAvatar,
        lastMessage: newMessage.content || newMessage.mediaUrl || 'Media',
        timestamp: formatTimestamp(newMessage.createdAt),
        incrementUnread: otherUserId !== selectedChat,
      });
    };

    const handleMessageUpdated = (updatedMessage: any) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, content: updatedMessage.content || msg.content } : msg))
      );
    };

    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageUpdated', handleMessageUpdated);
    socket.on('messageDeleted', handleMessageDeleted);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('messageDeleted', handleMessageDeleted);
    };
  }, [socket, currentUser.id, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    if (!token) return;

    try {
      const res = await fetch('http://localhost:4000/v1/messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
          recipientId: selectedChat,
        }),
      });
      const data = await res.json();
      if (data?.message) {
        const m = data.message;
        const newMessageObj = {
          id: m.id,
          sender: 'You',
          content: m.content || m.mediaUrl || 'Media',
          timestamp: formatTimestamp(m.createdAt),
          createdAt: m.createdAt,
          isOwn: true,
        };
        
        setMessages((prev) => [...prev, newMessageObj]);
        
        // Update cache for current chat
        setMessagesCache((prev) => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), newMessageObj]
        }));
        
        setMessage('');
        setTimeout(() => scrollToBottom(), 100);

        // Update chat preview for recipient
        upsertChatPreview(selectedChat, {
          name: selectedChatObj?.name,
          avatar: selectedChatObj?.avatar,
          lastMessage: m.content || m.mediaUrl || 'Media',
          timestamp: formatTimestamp(m.createdAt),
          resetUnread: true,
        });
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
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
  const groupedMessages = groupMessagesByDate(messages);

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
        <ScrollArea className="h-[calc(100vh-8rem)] scrollbar-custom">
          <div className="p-2">
            {chats.length === 0 ? (
              <div className="p-4 text-slate-400 text-center">
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs mt-1">Search for a user and start a chat.</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1',
                    selectedChat === chat.id
                      ? 'bg-purple-600/20 border border-purple-500/30'
                      : 'hover:bg-slate-700/30'
                  )}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.avatar || '/placeholder.svg'} alt={chat.name} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {chat.name.split(' ').map((n) => n[0]).join('')}
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
              ))
            )}
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

            <ScrollArea className="flex-1 scrollbar-custom">
              <div className="p-4 space-y-6 min-h-full">
                {loading && !messagesCache[selectedChat] ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : groupedMessages.length === 0 && !loading ? (
                  <div className="p-4 text-slate-400 text-center">
                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs mt-1">Start a conversation with your friend.</p>
                  </div>
                ) : (
                  groupedMessages.map((group, index) => (
                    <div key={group.date || index}>
                      {group.date && (
                        <div
                          className="sticky top-0 z-10 bg-transparent text-slate-300 text-center py-2 rounded-lg mx-auto w-fit px-4 mb-4"
                          style={{ minWidth: '120px' }}
                        >
                          <span className="text-sm font-medium">{group.date}</span>
                        </div>
                      )}
                      {group.messages.map((msg) => (
                        <div key={msg.id} className={cn("flex", msg.isOwn ? "justify-end" : "justify-start", "my-2")}>
                          <div
                            className={cn(
                              "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl flex gap-4",
                              msg.isOwn ? "bg-purple-600 text-white" : "bg-slate-700 text-white"
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={cn(
                                "text-[0.7rem] mt-1 justify-end",
                                msg.isOwn ? "text-purple-200" : "text-slate-400"
                              )}
                            >
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
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