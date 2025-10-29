"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Paperclip, Smile, Video, Phone, MessageCircle, ArrowLeft, Loader2, Check, CheckCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsContent } from "./SettingsContent";
import { IoCheckmarkDone } from "react-icons/io5";
import { FaFile, FaFilePdf, FaFileWord, FaFileExcel } from "react-icons/fa";
import Modal from "../ui/modalIMG";
import { RightSidebar } from "./RightSidebar";

interface ChatSectionProps {
  activeTab: string;
  selectedChat: string | null;
  onChatSelect: (chatId: string) => void;
  isMobile?: boolean;
  onToggleRightPanel?: () => void;
  selectedSetting: string | null;
  onSettingSelect: (setting: string) => void;
  socket: any;
  isRightCollapsed?: boolean;
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
  lastReadMessage?: string;
  lastReadTimestamp?: string;
  lastMessageStatus?: 'sent' | 'read';
  lastMessageFromCurrentUser?: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  createdAt: string;
  isOwn: boolean;
  isRead?: boolean;
  status?: 'sending' | 'sent' | 'read';
  mediaUrl?: string;
  mediaType?: string;
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
  isRightCollapsed = false,
}: ChatSectionProps) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [showRightSidebarModal, setShowRightSidebarModal] = useState(false);


  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("currentUser");
      setCurrentUser(raw ? JSON.parse(raw) : {});
    } catch {
      setCurrentUser({});
    }
  }, []);

  // Helper to format timestamp consistently
  const formatTimestamp = (dateStr?: string | Date, includeDate: boolean = false): string => {
    let dateInput = dateStr;
    if (!dateInput) {
      dateInput = new Date();
    }
    let dateString = typeof dateInput === 'string' ? dateInput : dateInput.toISOString();
    if (!dateString.endsWith('Z') && !/[\+\-]\d{2}:\d{2}$/.test(dateString)) {
      dateString += 'Z';
    }
    const date = new Date(dateString);
    if (includeDate) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
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

  // Group messages by date
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

  const getFileIcon = (mediaType?: string) => {
    if (!mediaType) return <FaFile className="h-6 w-6" />;
    const lowerType = mediaType.toLowerCase();
    if (lowerType.includes('pdf')) return <FaFilePdf className="h-6 w-6 text-red-500" />;
    if (
      lowerType.includes('word') ||
      lowerType.includes('wordprocessingml') ||
      lowerType.includes('msword') ||
      (lowerType.includes('document') && !lowerType.includes('spreadsheet'))
    ) {
      return <FaFileWord className="h-6 w-6 text-blue-500" />;
    }
    if (
      lowerType.includes('excel') ||
      lowerType.includes('spreadsheet') ||
      lowerType.includes('spreadsheetml') ||
      lowerType.includes('csv')
    ) {
      return <FaFileExcel className="h-6 w-6 text-green-500" />;
    }
    return <FaFile className="h-6 w-6" />;
  };

  const upsertChatPreview = (
    chatId: string,
    opts: {
      name?: string;
      avatar?: string;
      lastMessage?: string;
      timestamp?: string;
      incrementUnread?: boolean;
      resetUnread?: boolean;
      preserveOrder?: boolean;
      isFromCurrentUser?: boolean;
      messageStatus?: 'sent' | 'read';
    } = {}
  ) => {
    setChats((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === chatId);
      const timestamp = opts.timestamp;
      if (existingIndex !== -1) {
        const existing = prev[existingIndex];
        const updated: ChatItem = {
          ...existing,
          name: opts.name ?? existing.name,
          avatar: opts.avatar ?? existing.avatar,
          lastMessage: opts.lastMessage ?? (existing.lastMessage.includes('Media') ? 'Media' : existing.lastMessage),
          timestamp: timestamp ?? existing.timestamp,
          unread: opts.resetUnread
            ? 0
            : opts.incrementUnread
            ? (existing.unread || 0) + 1
            : existing.unread,
          lastReadMessage: opts.isFromCurrentUser
            ? opts.lastMessage ?? existing.lastReadMessage
            : existing.lastReadMessage,
          lastReadTimestamp: opts.isFromCurrentUser
            ? timestamp ?? existing.lastReadTimestamp
            : existing.lastReadTimestamp,
          lastMessageStatus: opts.isFromCurrentUser ? (opts.messageStatus || 'sent') : existing.lastMessageStatus,
          lastMessageFromCurrentUser: opts.isFromCurrentUser ?? existing.lastMessageFromCurrentUser,
        };
        if (opts.preserveOrder) {
          return [
            ...prev.slice(0, existingIndex),
            updated,
            ...prev.slice(existingIndex + 1),
          ];
        }
        return [updated, ...prev.slice(0, existingIndex), ...prev.slice(existingIndex + 1)];
      }
      const created: ChatItem = {
        id: chatId,
        name: opts.name || 'User',
        lastMessage: opts.lastMessage || '',
        timestamp: timestamp ?? formatTimestamp(),
        unread: opts.resetUnread ? 0 : opts.incrementUnread ? 1 : 0,
        avatar: opts.avatar,
        online: false,
        lastReadMessage: opts.isFromCurrentUser ? opts.lastMessage : undefined,
        lastReadTimestamp: opts.isFromCurrentUser ? timestamp : undefined,
        lastMessageStatus: opts.isFromCurrentUser ? (opts.messageStatus || 'sent') : undefined,
        lastMessageFromCurrentUser: opts.isFromCurrentUser,
      };
      return [created, ...prev];
    });
  };

  useEffect(() => {
    const loadConversations = async () => {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
      if (!token) return;

      try {
        const stored = typeof window !== 'undefined' ? sessionStorage.getItem('recentChats') : null;
        if (stored) {
          const parsed = JSON.parse(stored) as ChatItem[];
          if (Array.isArray(parsed)) setChats(parsed);
        }

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
              lastMessage: conv.lastMessage?.content || (conv.lastMessage?.mediaUrl ? 'Media' : ''),
              timestamp: conv.lastMessage?.createdAt ? formatTimestamp(conv.lastMessage.createdAt) : '',
              unread: Math.max(0, conv.unreadCount ?? conv.unread ?? 0),
              avatar: conv.participant?.avatar,
              online: false,
            }));
            setChats(mappedChats);
          }
        }
      } catch (e) {
        console.error('Failed to load conversations', e);
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
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('recentChats', JSON.stringify(chats));
    } catch (e) {
      // ignore
    }
  }, [chats]);

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

  const findChatIdByMessageId = (messageId: string | undefined) => {
    if (!messageId) return null;
    for (const [chatId, msgs] of Object.entries(messagesCache)) {
      if (msgs?.some((m) => m.id === messageId)) return chatId;
    }
    return null;
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    if (!token || !selectedChat) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessages([]);

    if (messagesCache[selectedChat]) {
      setMessages(messagesCache[selectedChat]);
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

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data?.messages)) {
          const mapped: Message[] = data.messages.map((m: any) => ({
            id: m.id,
            sender: m.senderId === currentUser.id ? 'You' : m.sender?.username || 'User',
            content: m.content || '',
            mediaUrl: m.mediaUrl || undefined,
            mediaType: m.mediaType || undefined,
            timestamp: formatTimestamp(m.createdAt),
            createdAt: m.createdAt,
            isOwn: m.senderId === currentUser?.id,
            isRead: m.isRead,
            status: m.senderId === currentUser.id ? (m.isRead ? 'read' as const : 'sent' as const) : undefined,
          }));

          setMessagesCache((prev) => ({ ...prev, [selectedChat]: mapped }));
          setMessages(mapped);

          const last = mapped[mapped.length - 1];
          if (last) {
            upsertChatPreview(selectedChat, {
              name: data?.recipient?.username || selectedChatObj?.name,
              avatar: data?.recipient?.avatar || selectedChatObj?.avatar,
              lastMessage: last.content || (last.mediaUrl ? (last.mediaType?.startsWith('image/') ? 'Image' : 'File') : ''),
              timestamp: last.timestamp,
              resetUnread: true,
              preserveOrder: true,
              isFromCurrentUser: last.isOwn,
              messageStatus: last.status === 'sending' ? 'sent' : (last.status === 'read' ? 'read' : 'sent'),
            });
          }
        } else {
          setMessages([]);
          setMessagesCache((prev) => ({ ...prev, [selectedChat]: [] }));
        }
      } catch (e) {
        console.error('Failed to load messages', e);
        setMessages([]);
        setMessagesCache((prev) => ({ ...prev, [selectedChat]: [] }));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat, currentUser?.id]);

  useEffect(() => {
    if (!selectedChat) {
      setLoading(false);
      setMessages([]);
      return;
    }

    upsertChatPreview(selectedChat, { resetUnread: true, preserveOrder: true });

    setMessages((prev) =>
      prev.map((m) => (m.isOwn ? { ...m, status: m.status === 'read' ? 'read' : m.status } : { ...m, isRead: true }))
    );
    setMessagesCache((prev) => ({
      ...prev,
      [selectedChat]: (prev[selectedChat] || []).map((m) =>
        m.isOwn ? { ...m, status: m.status === 'read' ? 'read' : m.status } : { ...m, isRead: true }
      ),
    }));
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      const isForThisChat =
        (newMessage.recipientId && newMessage.recipientId === currentUser?.id && newMessage.senderId === selectedChat) ||
        (newMessage.recipientId && newMessage.senderId === currentUser?.id && newMessage.recipientId === selectedChat);

      if (!selectedChat || !isForThisChat) return;

      const newMessageObj: Message = {
        id: newMessage.id,
        sender: newMessage.senderId === currentUser.id ? 'You' : newMessage.sender?.username || 'Unknown',
        content: newMessage.content || '',
        mediaUrl: newMessage.mediaUrl || undefined,
        mediaType: newMessage.mediaType || undefined,
        timestamp: formatTimestamp(newMessage.createdAt),
        createdAt: newMessage.createdAt,
        isOwn: newMessage.senderId === currentUser?.id,
        isRead: newMessage.isRead,
        status: newMessage.senderId === currentUser.id ? (newMessage.isRead ? 'read' as const : 'sent' as const) : undefined,
      };

      setMessages((prev) => [...prev, newMessageObj]);
      setMessagesCache((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMessageObj]
      }));

      const otherUserId = newMessage.senderId === currentUser.id ? newMessage.recipientId : newMessage.senderId;
      const otherUserName = newMessage.senderId === currentUser.id ? newMessage.recipient?.username : newMessage.sender?.username;
      const otherUserAvatar = newMessage.senderId === currentUser.id ? newMessage.recipient?.avatar : newMessage.sender?.avatar;

      const shouldIncrementUnread = newMessage.senderId !== currentUser?.id && otherUserId !== selectedChat;

      upsertChatPreview(otherUserId, {
        name: otherUserName,
        avatar: otherUserAvatar,
        lastMessage: newMessage.content || (newMessage.mediaUrl ? (newMessage.mediaType?.startsWith('image/') ? 'Image' : 'File') : 'Media'),
        timestamp: formatTimestamp(newMessage.createdAt),
        incrementUnread: shouldIncrementUnread,
        isFromCurrentUser: newMessage.senderId === currentUser?.id,
        messageStatus: newMessage.senderId === currentUser?.id ? (newMessage.status || 'sent') : undefined,
      });
    };

    const handleMessageUpdated = (updatedMessage: any) => {
      setMessages((prev) =>
        prev.map((msg: Message) => (msg.id === updatedMessage.id ? { ...msg, content: updatedMessage.content || msg.content } : msg))
      );
    };

    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) => prev.filter((msg: Message) => msg.id !== messageId));
    };

    const handleMessageRead = (data: { messageId: string; isRead: boolean }) => {
      setMessages((prev) =>
        prev.map((msg: Message) =>
          msg.id === data.messageId ? { ...msg, isRead: data.isRead, status: data.isRead ? 'read' as const : 'sent' as const } : msg
        )
      );

      if (selectedChat) {
        setMessagesCache((prev) => ({
          ...prev,
          [selectedChat]: prev[selectedChat]?.map((msg: Message) =>
            msg.id === data.messageId ? { ...msg, isRead: data.isRead, status: data.isRead ? 'read' as const : 'sent' as const } : msg
          ) || []
        }));
      }

      const chatIdFromCache = findChatIdByMessageId(data.messageId);
      const chatIdToUpdate = chatIdFromCache ?? selectedChat ?? null;
      if (chatIdToUpdate) {
        upsertChatPreview(chatIdToUpdate, {
          resetUnread: false,
          preserveOrder: true,
          messageStatus: data.isRead ? 'read' : 'sent',
        });
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageUpdated', handleMessageUpdated);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageRead', handleMessageRead);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, currentUser?.id, selectedChat, messagesCache]);

  useEffect(() => {
    if (!selectedChat) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const unreadMessageIds: string[] = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            const messageElement = entry.target as HTMLElement;
            const isOwnMessage = messageElement.getAttribute('data-is-own') === 'true';

            if (messageId && !readMessages.has(messageId)) {
              setReadMessages(prev => new Set([...prev, messageId]));

              if (!isOwnMessage) {
                unreadMessageIds.push(messageId);
              }
            }
          }
        });

        if (unreadMessageIds.length > 0) {
          const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
          if (token) {
            fetch('http://localhost:4000/v1/messages/mark-read', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ recipientId: selectedChat }),
            }).then(() => {
              setMessages(prev => prev.map(msg => {
                if (msg.isOwn && msg.status === 'sent') {
                  return { ...msg, status: 'read' as const };
                }
                return msg;
              }));

              setMessagesCache(prev => ({
                ...prev,
                [selectedChat]: prev[selectedChat]?.map(msg => {
                  if (msg.isOwn && msg.status === 'sent') {
                    return { ...msg, status: 'read' as const };
                  }
                  return msg;
                }) || []
              }));

              upsertChatPreview(selectedChat, {
                resetUnread: true,
                preserveOrder: true,
                messageStatus: 'read',
              });
            }).catch(e => console.warn('Failed to mark messages as read', e));
          }
        }
      },
      { threshold: 0.5 }
    );

    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [selectedChat, messages, readMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setModalImage(imageUrl);
    setShowModal(true);
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleScrollDown = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setShowScrollDownButton(false);
    }
  };

  useEffect(() => {
    if (!selectedChat || !scrollAreaRef.current) return;

    const scrollArea = scrollAreaRef.current;
    const checkScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollDownButton(!isNearBottom);
    };

    scrollArea.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();

    return () => scrollArea.removeEventListener('scroll', checkScrollPosition);
  }, [selectedChat, messages]);

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !selectedChat) return;

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append('content', message.trim());
      formData.append('recipientId', selectedChat);
      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const res = await fetch('http://localhost:4000/v1/messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data?.message) {
        const m = data.message;
        const newMessageObj: Message = {
          id: m.id,
          sender: 'You',
          content: m.content || '',
          mediaUrl: m.mediaUrl || undefined,
          mediaType: m.mediaType || undefined,
          timestamp: formatTimestamp(m.createdAt),
          createdAt: m.createdAt,
          isOwn: true,
          isRead: false,
          status: 'sent' as const,
        };

        setMessages((prev) => [...prev, newMessageObj]);
        setMessagesCache((prev) => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), newMessageObj]
        }));
        setMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        upsertChatPreview(selectedChat, {
          name: selectedChatObj?.name,
          avatar: selectedChatObj?.avatar,
          lastMessage: m.content || (m.mediaUrl ? (m.mediaType?.startsWith('image/') ? 'Image' : 'File') : 'Media'),
          timestamp: formatTimestamp(m.createdAt),
          resetUnread: true,
          isFromCurrentUser: true,
          messageStatus: 'sent',
        });
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const handleBackToList = () => {
    setLoading(false);
    setMessages([]);
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
                <img src="/icons/add_user.svg" alt="No messages" className="h-24 w-24 mx-auto mb-4 opacity-50" />
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
                      {(chat.lastMessage || chat.lastReadMessage) && (
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <p className="text-sm text-slate-400 truncate">
                              {chat.unread > 0 && chat.lastReadMessage ? chat.lastReadMessage : chat.lastMessage}
                            </p>
                            {chat.lastMessageFromCurrentUser && (
                              <div className="flex-shrink-0">
                                {chat.lastMessageStatus === 'read' ? (
                                  <IoCheckmarkDone className="w-6 h-5 text-blue-400" />
                                ) : (
                                  <Check className="w-6 h-4 text-slate-400" />
                                )}
                              </div>
                            )}
                          </div>
                          {chat.unread > 0 && (
                            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2">
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
          "flex-1 flex flex-col bg-slate-900/10 relative",
          isMobile ? (selectedChat ? "w-full" : "hidden") : "flex-1"
        )}
      >
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
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
                  <button
                    type="button"
                    onClick={() => {
                      if (isMobile) {
                        setShowRightSidebarModal(true);
                      } else {
                        onToggleRightPanel?.();
                      }
                    }}
                    className="flex items-center space-x-3 group"
                  >
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

            <ScrollArea ref={scrollAreaRef} className={cn("flex-1 scrollbar-custom overflow-y-auto", isMobile ? "max-h-[calc(100vh-12rem)] overflow-y-auto" : "max-h-[calc(100vh-8rem)] overflow-y-auto")}>
              <div className="p-4 space-y-6 min-h-full">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : groupedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No conversation yet</h3>
                    <p className="text-slate-400 mb-4 max-w-sm">
                      Start your first conversation with {selectedChatObj?.name || 'this user'} .
                    </p>
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
                          <div
                            key={msg.id}
                            className={cn("flex", msg.isOwn ? "justify-end" : "justify-start", "my-2")}
                            data-message-id={msg.id}
                            data-is-own={msg.isOwn.toString()}
                          >
                            <div
                              className={cn(
                                "max-w-xs lg:max-w-md rounded-2xl flex flex-col",
                                // remove inner padding for images, keep it for other messages
                                msg.mediaType?.startsWith('image/') ? "w-full" : "px-4 py-2",
                                msg.isOwn ? "bg-purple-600 text-white" : "bg-slate-700 text-white"
                              )}
                            >
                              {/* IMAGE CASE - full-bleed image with overlayed timestamp/check */}
                              {msg.mediaUrl && msg.mediaType?.startsWith('image/') ? (
                                <div className="mb-0 w-full">
                                  <div
                                    className={cn(
                                      "relative w-full overflow-hidden rounded-2xl",
                                      // subtle border/ring depending on sender
                                      msg.isOwn ? "ring-2 ring-purple-500/40" : "ring-1 ring-slate-600/30"
                                    )}
                                  >
                                    <img
                                      src={msg.mediaUrl || ''}
                                      alt="Sent image"
                                      // make image fill the container; adjust h-64 to taste or use max-h
                                      className="w-full h-64 object-cover block"
                                      onClick={() => msg.mediaUrl && handleImageClick(msg.mediaUrl)}
                                    />
                                    {/* overlay: timestamp + check; sits above image */}
                                    <div className="absolute bottom-2 right-2 z-20 flex items-center gap-2 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                                      <p className={cn("text-[0.7rem] text-white")}>{msg.timestamp}</p>
                                      {msg.isOwn && (
                                        <div className="ml-0">
                                          {msg.status === 'read' ? (
                                            <IoCheckmarkDone className="w-5 h-4 text-blue-300" />
                                          ) : (
                                            <Check className="w-5 h-4 text-purple-200" />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* optional caption/content under image */}
                                  {msg.content && <p className="text-sm mt-2 px-0">{msg.content}</p>}
                                </div>
                              ) : (
                                /* NON-IMAGE CASE - keep previous layout */
                                <>
                                  {msg.mediaUrl && (
                                    <div className="mb-2">
                                      <div className="pr-3 bg-slate-700/30 rounded-lg border border-slate-600/50 max-w-xs">
                                        <div className="flex items-center space-x-3">
                                          <div
                                            className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center cursor-pointer"
                                            onClick={() => msg.mediaUrl && window.open(msg.mediaUrl, '_blank')}
                                          >
                                            {getFileIcon(msg.mediaType || '')}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">
                                              {!msg.mediaType?.startsWith('image/') &&
                                                (() => {
                                                  const fileName = msg.mediaUrl?.split('/').pop() || 'File';
                                                  try {
                                                    return decodeURIComponent(fileName);
                                                  } catch {
                                                    return fileName;
                                                  }
                                                })()}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                              {!msg.mediaType?.startsWith('image/') && 'Click to download'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {msg.content && <p className="text-sm">{msg.content}</p>}
                                  {/* timestamp/check for non-image messages */}
                                  <div className="flex items-center justify-end mt-1">
                                    <p
                                      className={cn(
                                        "text-[0.7rem]",
                                        msg.isOwn ? "text-purple-200" : "text-slate-400"
                                      )}
                                    >
                                      {msg.timestamp}
                                    </p>
                                    {msg.isOwn && (
                                      <div className="ml-1">
                                        {msg.status === 'read' ? (
                                          <IoCheckmarkDone className="w-6 h-5 text-blue-400" />
                                        ) : (
                                          <Check className="w-6 h-4 text-purple-200" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))
                )}
                <div ref={lastMessageRef} />
              </div>
            </ScrollArea>

            {showScrollDownButton && (
              <div className="absolute bottom-24 right-4 z-50 pointer-events-none">
                <Button
                  onClick={handleScrollDown}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg animate-bounce pointer-events-auto"
                  size="icon"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="p-4 border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm sticky bottom-0 z-10">
              {selectedFile && (
                <div className="mb-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                          {getFileIcon(selectedFile.type || '')}
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-white font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50"
                  onClick={handlePaperclipClick}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
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

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <img
            src={modalImage}
            alt="Full size image"
            className="max-w-[50rem] max-h-[40rem] object-contain"
          />
        </Modal>
      )}

      {showRightSidebarModal && isMobile && (
        <Modal onClose={() => setShowRightSidebarModal(false)}>
          <div className="w-full max-w-md mx-auto">
            <RightSidebar
              selectedChat={selectedChat}
              collapsed={false}
              onClose={() => setShowRightSidebarModal(false)}
            />
          </div>
        </Modal>
      )}

    </div>
  );
}
