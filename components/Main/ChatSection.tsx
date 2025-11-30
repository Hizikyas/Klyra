"use client";

import { useEffect, useState, useRef } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Video,
  Phone,
  ArrowLeft,
  Loader2,
  Check,
  CheckCheck,
  ChevronDown,
  Reply,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  lastSeen?: string;
}

interface ReplyTo {
  id: string;
  content?: string;
  sender: { username: string };
  mediaUrl?: string;
  mediaType?: string;
  isDeleted?: boolean;
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
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: ReplyTo;
}

const normalizeId = (value: string | number | null | undefined): string | null =>
  value === undefined || value === null ? null : String(value);

export function ChatSection(props: ChatSectionProps) {
  const {
    activeTab,
    selectedChat,
    onChatSelect,
    isMobile = false,
    onToggleRightPanel,
    selectedSetting,
    onSettingSelect,
    socket,
    isRightCollapsed = false,
  } = props;
     
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
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteForEveryone, setDeleteForEveryone] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, { isOnline: boolean; lastSeen?: string }>>({});
  const chatsRef = useRef<ChatItem[]>([]);

  const [contextMenu, setContextMenu] = useState<{
    message: Message | null;
    x: number;
    y: number;
    visible: boolean;
  }>({ message: null, x: 0, y: 0, visible: false });
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedChatKey = normalizeId(selectedChat);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("currentUser");
      setCurrentUser(raw ? JSON.parse(raw) : {});
    } catch {
      setCurrentUser({});
    }
  }, []);

  const formatTimestamp = (dateStr?: string | Date, includeDate: boolean = false): string => {
    let dateInput = dateStr;
    if (!dateInput) dateInput = new Date();
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

  const formatLastSeen = (lastSeen?: string): string => {
    if (!lastSeen) return "Offline";

    const now = Date.now();
    const seen = new Date(lastSeen).getTime();
    const diffMins = Math.floor((now - seen) / 60000);

    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 5) return "Last seen recently";
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `Last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffMins < 2880) return "Last seen yesterday";
    return `Last seen ${new Date(lastSeen).toLocaleDateString()}`;
  };

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
      online?: boolean; // ← accept online
      lastSeen?: string; // ← accept lastSeen
    } = {}
  ) => {
    setChats((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === chatId);
      const timestamp = opts.timestamp || formatTimestamp();
      if (existingIndex !== -1) {
        const existing = prev[existingIndex];
        const updated: ChatItem = {
          ...existing,
          name: opts.name ?? existing.name,
          avatar: opts.avatar ?? existing.avatar,
          lastMessage: opts.lastMessage ?? (existing.lastMessage.includes('Media') ? 'Media' : existing.lastMessage),
          timestamp: timestamp,
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
          online: opts.online ?? existing.online,
          lastSeen: opts.lastSeen ?? existing.lastSeen,
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
        timestamp: timestamp,
        unread: opts.resetUnread ? 0 : opts.incrementUnread ? 1 : 0,
        avatar: opts.avatar,
        online: opts.online ?? false,
        lastSeen: opts.lastSeen,
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
          if (Array.isArray(parsed)) {
            setChats(
              parsed
                .map((chat) => ({
                  ...chat,
                  id: normalizeId(chat.id) ?? '',
                }))
                .filter((chat) => chat.id)
            );
          }
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
            const mappedChats: ChatItem[] = data.conversations
              .map((conv: any) => {
                const participantId = normalizeId(conv.participantId);
                if (!participantId) return null;
                return {
                  id: participantId,
                  name: conv.participant?.username || 'User',
                  lastMessage: conv.lastMessage?.content || (conv.lastMessage?.mediaUrl ? 'Media' : ''),
                  timestamp: conv.lastMessage?.createdAt ? formatTimestamp(conv.lastMessage.createdAt) : '',
                  unread: Math.max(0, conv.unreadCount ?? conv.unread ?? 0),
                  avatar: conv.participant?.avatar,
                  online: onlineStatus[participantId]?.isOnline ?? false,
                  lastSeen: onlineStatus[participantId]?.lastSeen,
                };
              })
              .filter(Boolean) as ChatItem[];
            setChats(mappedChats);
          }
        }
      } catch (e) {
        console.error('Failed to load conversations', e);
      }
    };

    loadConversations();
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [onlineStatus]);

  useEffect(() => {
    try {
      sessionStorage.setItem('recentChats', JSON.stringify(chats));
    } catch (e) {}
    // Keep ref in sync
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    const onAddChatFromSearch = (e: Event) => {
      const custom = e as CustomEvent;
      const u = custom.detail || {};
      const userId = normalizeId(u?.id);
      if (!userId) return;
      setChats((prev) => {
        const exists = prev.some((c) => c.id === userId);
        const next = exists
          ? prev
          : [
              {
                id: userId,
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
      onChatSelect(userId);
    };
    window.addEventListener('klyra:addChatFromSearch', onAddChatFromSearch as EventListener);
    return () => window.removeEventListener('klyra:addChatFromSearch', onAddChatFromSearch as EventListener);
  }, [onChatSelect]);

  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    const handleUserOnline = (data: { userId: string | number }) => {
      const userId = normalizeId(data.userId);
      if (!userId) return;
      setOnlineStatus((prev) => ({
        ...prev,
        [userId]: { isOnline: true },
      }));
      upsertChatPreview(userId, { online: true });
    };

    const handleUserOffline = (data: { userId: string | number; lastSeen: string }) => {
      const userId = normalizeId(data.userId);
      if (!userId) return;
      setOnlineStatus((prev) => ({
        ...prev,
        [userId]: { isOnline: false, lastSeen: data.lastSeen },
      }));
      upsertChatPreview(userId, { online: false, lastSeen: data.lastSeen });
    };

    const handleOnlineUsers = (onlineUserIds: (string | number)[]) => {
      const normalizedOnlineIds = new Set(
        onlineUserIds
          .map((id) => normalizeId(id))
          .filter((id): id is string => Boolean(id))
      );
      setOnlineStatus((prev) => {
        const updated = { ...prev };
        normalizedOnlineIds.forEach((id) => {
          updated[id] = { isOnline: true };
        });
        return updated;
      });
      // Update chats to reflect online status
      setChats((prev) =>
        prev.map((chat) =>
          normalizedOnlineIds.has(chat.id) ? { ...chat, online: true } : chat
        )
      );
    };

    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('onlineUsers', handleOnlineUsers);

    return () => {
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('onlineUsers', handleOnlineUsers);
    };
  }, [socket, currentUser?.id]);

  const findChatIdByMessageId = (messageId: string | undefined) => {
    if (!messageId) return null;
    for (const [chatId, msgs] of Object.entries(messagesCache)) {
      if (msgs?.some((m) => m.id === messageId)) return chatId;
    }
    return null;
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    const chatKey = normalizeId(selectedChat);
    if (!token || !chatKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessages([]);

    if (messagesCache[chatKey]) {
      setMessages(messagesCache[chatKey]);
    }

    const fetchMessages = async () => {
      try {
        const url = new URL('http://localhost:4000/v1/messages');
        url.searchParams.set('recipientId', chatKey);
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
            isEdited: m.isEdited,
            isDeleted: m.isDeleted,
            replyTo: m.replyTo ? {
              id: m.replyTo.id,
              content: m.replyTo.content,
              sender: { username: m.replyTo.sender?.username || 'User' },
              mediaUrl: m.replyTo.mediaUrl,
              mediaType: m.replyTo.mediaType,
              isDeleted: m.replyTo.isDeleted,
            } : undefined,
          }));

          setMessagesCache((prev) => ({ ...prev, [chatKey]: mapped }));
          setMessages(mapped);

          const last = mapped[mapped.length - 1];
          if (last) {
            upsertChatPreview(chatKey, {
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
          setMessagesCache((prev) => ({ ...prev, [chatKey]: [] }));
        }
      } catch (e) {
        console.error('Failed to load messages', e);
        setMessages([]);
        setMessagesCache((prev) => ({ ...prev, [chatKey]: [] }));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Polling fallback: Check for new messages every 3 seconds if socket might not be working
    const pollInterval = setInterval(async () => {
      if (!chatKey || !token) return;
      
      try {
        const url = new URL('http://localhost:4000/v1/messages');
        url.searchParams.set('recipientId', chatKey);
        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (res.ok) {
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
              isEdited: m.isEdited,
              isDeleted: m.isDeleted,
              replyTo: m.replyTo ? {
                id: m.replyTo.id,
                content: m.replyTo.content,
                sender: { username: m.replyTo.sender?.username || 'User' },
                mediaUrl: m.replyTo.mediaUrl,
                mediaType: m.replyTo.mediaType,
                isDeleted: m.replyTo.isDeleted,
              } : undefined,
            }));

            // Only update if there are new messages
            const currentMessages = messagesCache[chatKey] || [];
            const latestMessageId = currentMessages[currentMessages.length - 1]?.id;
            const newMessages = mapped.filter(m => !currentMessages.some(cm => cm.id === m.id));
            
            if (newMessages.length > 0) {
              console.log('🔄 [POLLING] Found new messages:', newMessages.length);
              setMessagesCache((prev) => ({ ...prev, [chatKey]: mapped }));
              setMessages(mapped);
            }
          }
        }
      } catch (e) {
        // Silently fail polling
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [selectedChat, currentUser?.id]);

  useEffect(() => {
    if (!selectedChatKey) {
      setLoading(false);
      setMessages([]);
      return;
    }

    upsertChatPreview(selectedChatKey, { resetUnread: true, preserveOrder: true });

    setMessages((prev) =>
      prev.map((m) => (m.isOwn ? { ...m, status: m.status === 'read' ? 'read' : m.status } : { ...m, isRead: true }))
    );
    setMessagesCache((prev) => ({
      ...prev,
      [selectedChatKey]: (prev[selectedChatKey] || []).map((m) =>
        m.isOwn ? { ...m, status: m.status === 'read' ? 'read' : m.status } : { ...m, isRead: true }
      ),
    }));
  }, [selectedChat, selectedChatKey]);

  useEffect(() => {
    if (!socket || !currentUser?.id) {
      console.log('⚠️ [FRONTEND] Socket handler not initialized:', { 
        hasSocket: !!socket, 
        hasCurrentUser: !!currentUser?.id,
        socketId: socket?.id,
        socketConnected: socket?.connected
      });
      return;
    }

    console.log('🎧 [FRONTEND] Registering socket listeners for user:', currentUser.id);
    console.log('🔌 [FRONTEND] Socket status:', {
      connected: socket.connected,
      id: socket.id,
      disconnected: socket.disconnected
    });

    const handleNewMessage = (newMessage: any) => {
      console.log('🟢 [FRONTEND] handleNewMessage called:', {
        messageId: newMessage.id,
        senderId: newMessage.senderId,
        recipientId: newMessage.recipientId,
        currentUserId: currentUser.id,
        selectedChat: selectedChat,
        content: newMessage.content?.substring(0, 50)
      });

      // Use the EXACT same logic as the working version
      const isForThisChat =
        (!!newMessage.recipientId && String(newMessage.recipientId) === String(currentUser.id) && String(newMessage.senderId) === String(selectedChat)) ||
        (!!newMessage.recipientId && String(newMessage.senderId) === String(currentUser.id) && String(newMessage.recipientId) === String(selectedChat));

      console.log('🔍 [FRONTEND] Chat check:', {
        isForThisChat,
        selectedChat,
        condition1: !!newMessage.recipientId && String(newMessage.recipientId) === String(currentUser.id) && String(newMessage.senderId) === String(selectedChat),
        condition2: !!newMessage.recipientId && String(newMessage.senderId) === String(currentUser.id) && String(newMessage.recipientId) === String(selectedChat),
        recipientIdMatch: String(newMessage.recipientId) === String(currentUser.id),
        senderIdMatch: String(newMessage.senderId) === String(selectedChat),
        senderIdMatch2: String(newMessage.senderId) === String(currentUser.id),
        recipientIdMatch2: String(newMessage.recipientId) === String(selectedChat)
      });

      if (!selectedChat || !isForThisChat) {
        console.log('⚠️ [FRONTEND] Message NOT for selected chat, updating sidebar only');
        // Still update sidebar for other chats
        const currentUserId = String(currentUser.id);
        const senderId = String(newMessage.senderId || '');
        const recipientId = String(newMessage.recipientId || '');
        
        if (senderId === currentUserId || recipientId === currentUserId) {
          const chatPartnerId = senderId === currentUserId ? recipientId : senderId;
          const chatPartner = chatsRef.current.find(c => String(c.id) === chatPartnerId);
          const lastMessageText = newMessage.content ||
            (newMessage.mediaUrl ? (newMessage.mediaType?.startsWith('image/') ? 'Image' : 'File') : '');
          
          upsertChatPreview(chatPartnerId, {
            name: chatPartner?.name,
            avatar: chatPartner?.avatar,
            lastMessage: lastMessageText,
            timestamp: formatTimestamp(newMessage.createdAt),
            incrementUnread: senderId !== currentUserId,
            preserveOrder: true,
            isFromCurrentUser: senderId === currentUserId,
            messageStatus: senderId === currentUserId
              ? (newMessage.isRead ? 'read' : 'sent')
              : undefined,
          });
        }
        return;
      }

      // Message is for the currently selected chat - update immediately
      const newMessageObj: Message = {
        id: newMessage.id,
        sender: newMessage.senderId === currentUser.id ? 'You' : newMessage.sender?.username || newMessage.sender?.fullname || 'Unknown',
        content: newMessage.content || newMessage.mediaUrl || '',
        mediaUrl: newMessage.mediaUrl || undefined,
        mediaType: newMessage.mediaType || undefined,
        timestamp: formatTimestamp(newMessage.createdAt),
        createdAt: newMessage.createdAt,
        isOwn: newMessage.senderId === currentUser.id,
        isRead: newMessage.isRead,
        status: newMessage.senderId === currentUser.id ? (newMessage.isRead ? 'read' as const : 'sent' as const) : undefined,
        isEdited: newMessage.isEdited,
        isDeleted: newMessage.isDeleted,
        replyTo: newMessage.replyTo ? {
          id: newMessage.replyTo.id,
          content: newMessage.replyTo.content,
          sender: { username: newMessage.replyTo.sender?.username || 'User' },
          mediaUrl: newMessage.replyTo.mediaUrl,
          mediaType: newMessage.replyTo.mediaType,
          isDeleted: newMessage.replyTo.isDeleted,
        } : undefined,
      };

      // Update cache
      const chatKey = String(selectedChat);
      setMessagesCache((prev) => {
        const existing = prev[chatKey] || [];
        const existingIndex = existing.findIndex((m) => m.id === newMessageObj.id);
        if (existingIndex !== -1) {
          const updated = [...existing];
          updated[existingIndex] = { ...updated[existingIndex], ...newMessageObj };
          return { ...prev, [chatKey]: updated };
        }
        return { ...prev, [chatKey]: [...existing, newMessageObj] };
      });

      // IMMEDIATELY update the displayed messages - this is the critical fix
      console.log('✅ [FRONTEND] Message IS for selected chat, updating messages state');
      setMessages((prev) => {
        const existingIndex = prev.findIndex((m) => m.id === newMessageObj.id);
        if (existingIndex !== -1) {
          console.log('🔄 [FRONTEND] Updating existing message in state');
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...newMessageObj };
          return updated;
        }
        console.log('➕ [FRONTEND] Adding new message to state. Previous count:', prev.length);
        const newState = [...prev, newMessageObj];
        console.log('📊 [FRONTEND] New messages count:', newState.length);
        return newState;
      });

      // Update sidebar preview
      const selectedChatObj = chatsRef.current.find(c => String(c.id) === String(selectedChat));
      const lastMessageText = newMessage.content ||
        (newMessage.mediaUrl ? (newMessage.mediaType?.startsWith('image/') ? 'Image' : 'File') : '');

      upsertChatPreview(String(selectedChat), {
        name: selectedChatObj?.name,
        avatar: selectedChatObj?.avatar,
        lastMessage: lastMessageText,
        timestamp: formatTimestamp(newMessage.createdAt),
        resetUnread: true,
        preserveOrder: true,
        isFromCurrentUser: newMessage.senderId === currentUser.id,
        messageStatus: newMessage.senderId === currentUser.id
          ? (newMessage.isRead ? 'read' : 'sent')
          : undefined,
      });

      // Auto-scroll to bottom
      setTimeout(() => {
        if (lastMessageRef.current) {
          lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    };

    const handleMessageUpdated = (updatedMessage: any) => {
      if (!selectedChatKey) return;
      const chatId = selectedChatKey;
      setMessages((prev) =>
        prev.map((msg: Message) => (msg.id === updatedMessage.id ? { ...msg, content: updatedMessage.content || msg.content, isEdited: updatedMessage.isEdited } : msg))
      );
      setMessagesCache((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map((msg: Message) => (msg.id === updatedMessage.id ? { ...msg, content: updatedMessage.content || msg.content, isEdited: updatedMessage.isEdited } : msg))
      }));
    };

    const handleMessageDeleted = ({ messageId, deleteForEveryone }: { messageId: string, deleteForEveryone: boolean }) => {
      setMessages((prev) => {
        // Always filter out the deleted message completely
        return prev.filter((msg) => msg.id !== messageId);
      });
      
      if (selectedChatKey) {
        setMessagesCache((prev) => ({
          ...prev,
          [selectedChatKey]: (prev[selectedChatKey] || []).filter((msg: Message) => msg.id !== messageId)
        }));
      }
    };

    const handleMessageRead = (data: { messageId: string; isRead: boolean }) => {
      setMessages((prev) =>
        prev.map((msg: Message) =>
          msg.id === data.messageId ? { ...msg, isRead: data.isRead, status: data.isRead ? 'read' as const : 'sent' as const } : msg
        )
      );

      if (selectedChatKey) {
        setMessagesCache((prev) => ({
          ...prev,
          [selectedChatKey]: prev[selectedChatKey]?.map((msg: Message) =>
            msg.id === data.messageId ? { ...msg, isRead: data.isRead, status: data.isRead ? 'read' as const : 'sent' as const } : msg
          ) || []
        }));
      }

      const chatIdFromCache = findChatIdByMessageId(data.messageId);
      const chatIdToUpdate = chatIdFromCache ?? selectedChatKey ?? null;
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

    console.log('✅ [FRONTEND] Socket listeners registered successfully');

    return () => {
      console.log('🧹 [FRONTEND] Cleaning up socket listeners');
      socket.off('newMessage', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, currentUser?.id, selectedChat]);

  // Only sync from cache when switching chats, NOT when cache updates
  useEffect(() => {
    if (!selectedChatKey) {
      setMessages([]);
      return;
    }
    const cachedMessages = messagesCache[selectedChatKey];
    if (cachedMessages) {
      setMessages(cachedMessages);
    } else {
      setMessages([]);
    }
  }, [selectedChat, selectedChatKey]); // Removed messagesCache to prevent overwriting real-time updates

  useEffect(() => {
    if (!selectedChatKey) return;

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
              body: JSON.stringify({ recipientId: selectedChatKey }),
            }).then(() => {
              setMessages(prev => prev.map(msg => {
                if (msg.isOwn && msg.status === 'sent') {
                  return { ...msg, status: 'read' as const };
                }
                return msg;
              }));

              setMessagesCache(prev => ({
                ...prev,
                [selectedChatKey]: prev[selectedChatKey]?.map(msg => {
                  if (msg.isOwn && msg.status === 'sent') {
                    return { ...msg, status: 'read' as const };
                  }
                  return msg;
                }) || []
              }));

              upsertChatPreview(selectedChatKey, {
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
  }, [selectedChatKey, messages, readMessages]);

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
    const chatKey = selectedChatKey;
    if ((!message.trim() && !selectedFile) || !chatKey) return;

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    if (!token) return;

    try {
      const formData = new FormData();
      if (!editingMessage) {
        formData.append('content', message.trim());
        formData.append('recipientId', chatKey);
        if (replyingTo) {
          formData.append('replyToId', replyingTo.id);
        }
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
            isEdited: m.isEdited,
            isDeleted: m.isDeleted,
            replyTo: m.replyTo ? {
              id: m.replyTo.id,
              content: m.replyTo.content,
              sender: { username: m.replyTo.sender?.username || 'User' },
              mediaUrl: m.replyTo.mediaUrl,
              mediaType: m.replyTo.mediaType,
              isDeleted: m.replyTo.isDeleted,
            } : undefined,
          };

          setMessages((prev) => [...prev, newMessageObj]);
          setMessagesCache((prev) => ({
            ...prev,
            [chatKey]: [...(prev[chatKey] || []), newMessageObj]
          }));
          setMessage('');
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setReplyingTo(null);

          upsertChatPreview(chatKey, {
            name: selectedChatObj?.name,
            avatar: selectedChatObj?.avatar,
            lastMessage: m.content || (m.mediaUrl ? (m.mediaType?.startsWith('image/') ? 'Image' : 'File') : 'Media'),
            timestamp: formatTimestamp(m.createdAt),
            resetUnread: true,
            isFromCurrentUser: true,
            messageStatus: 'sent',
          });
        }
      } else {
        const res = await fetch(`http://localhost:4000/v1/messages/${editingMessage.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: message.trim() }),
        });

        const data = await res.json();
        if (data?.message) {
          const updated = data.message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updated.id ? { ...msg, content: updated.content, isEdited: true } : msg))
          );
          setMessagesCache((prev) => ({
            ...prev,
            [chatKey]: (prev[chatKey] || []).map((msg) => (msg.id === updated.id ? { ...msg, content: updated.content, isEdited: true } : msg))
          }));
          setMessage('');
          setEditingMessage(null);
        }
      }
    } catch (e) {
      console.error('Failed to send/update message', e);
    }
  };

  const handleCopyMessage = async (msg: Message) => {
    if (msg.content && !msg.isDeleted) {
      try {
        await navigator.clipboard.writeText(msg.content);
      } catch (e) {
        console.error('Failed to copy message', e);
      }
    }
    setContextMenu({ message: null, x: 0, y: 0, visible: false });
  };

  const handleDeleteConfirm = async () => {
    const chatKey = selectedChatKey;
    if (!contextMenu.message || !chatKey) return;

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4000/v1/messages/${contextMenu.message.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deleteForEveryone }),
      });

      if (res.ok) {
        // Always completely remove the message from both state and cache
        setMessages((prev) => prev.filter((msg) => msg.id !== contextMenu.message!.id));
        setMessagesCache((prev) => ({
          ...prev,
          [chatKey]: (prev[chatKey] || []).filter((msg) => msg.id !== contextMenu.message!.id)
        }));
        
        setShowDeleteConfirm(false);
        setDeleteForEveryone(false);
        setContextMenu({ message: null, x: 0, y: 0, visible: false });
      }
    } catch (e) {
      console.error('Failed to delete message', e);
    }
  };

  const handleBackToList = () => {
    setLoading(false);
    setMessages([]);
    onChatSelect("");
  };

  // Context Menu: Open
  const openContextMenu = (msg: Message, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setContextMenu({ message: msg, x, y, visible: true });
  };

  // Context Menu: Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu.visible]);

  // Adjust menu position to stay in viewport
  useEffect(() => {
    if (!contextMenu.visible || !menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    let { x, y } = contextMenu;

    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 10;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [contextMenu]);

  const selectedChatObj = chats.find((c) => c.id === selectedChat);
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 bg-slate-800/20 backdrop-blur-sm border-r border-slate-700/50 relative z-10",
          isMobile ? (selectedChat ? "hidden" : "w-full") : "w-full md:w-80"
        )}
      >
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] scrollbar-custom">
          <div className="p-2">
  {chats.length === 0 ? (
  <div className="p-4 text-slate-400 text-center">
    <img src="/icons/add_user.svg" alt="No messages" className="h-24 w-24 mx-auto mb-4 opacity-50" />
    <p className="text-sm">No conversations yet.</p>
    <p className="text-xs mt-1">Search for a user and start a chat.</p>
  </div>
) : (
  chats.map((chat) => {
    // Get real-time status (fallback to chat.online if not in map)
    const status = onlineStatus[chat.id] ?? {
      isOnline: chat.online ?? false,
      lastSeen: chat.lastSeen,
    };

    return (
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

            {/* Online/Offline dot */}
            <div
              className={cn(
                "absolute bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800",
                status.isOnline ? "bg-green-500" : "bg-slate-500"
              )}
            />
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
                      {chat.lastMessageStatus === "read" ? (
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
    );
  })
)}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-slate-900/10 relative w-full",
          isMobile ? (selectedChat ? "w-full" : "hidden") : "flex-1"
        )}
      >
        {selectedChat ? (
          <>
            <div className="p-3 md:p-4 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                {(isMobile || window.innerWidth < 768) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50 flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isMobile || window.innerWidth < 768) {
                      setShowRightSidebarModal(true);
                    } else {
                      onToggleRightPanel?.();
                    }
                  }}
                  className="flex items-center space-x-2 md:space-x-3 group text-left min-w-0"
                >
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                    <AvatarImage
                      src={selectedChatObj?.avatar || "/placeholder.svg"}
                      alt={selectedChatObj?.name || "Chat"}
                    />
                    <AvatarFallback className="bg-purple-600 text-white text-xs md:text-sm">
                      {(selectedChatObj?.name || "").split(" ").map((n) => n[0]).join("") || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm md:text-base truncate">{selectedChatObj?.name || "Conversation"}</h3>
                    {(() => {
                      const status = onlineStatus[selectedChatKey || ''] || { isOnline: selectedChatObj?.online || false, lastSeen: selectedChatObj?.lastSeen };
                      return status.isOnline ? (
                        <p className="text-xs md:text-sm text-green-400">Online</p>
                      ) : (
                        <p className="text-xs text-slate-400 truncate">
                          {status.lastSeen ? formatLastSeen(status.lastSeen) : "Offline"}
                        </p>
                      );
                    })()}
                  </div>
                </button>
                <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50 hidden sm:flex">
                    <Phone className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50 hidden sm:flex">
                    <Video className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea ref={scrollAreaRef} className={cn("flex-1 scrollbar-custom overflow-y-auto", isMobile ? "max-h-[calc(100vh-12rem)]" : "max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-8rem)]")}>
              <div className="p-4 space-y-6 min-h-full">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : groupedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No conversation yet</h3>
                    <p className="text-slate-400 mb-4 max-w-sm">
                      Start your first conversation with {selectedChatObj?.name || 'this user'}.
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group, index) => (
                    <div key={group.date || index}>
                      {group.date && (
                        <div className="sticky top-0 z-10 bg-transparent text-slate-300 text-center py-2 rounded-lg mx-auto w-fit px-4 mb-4">
                          <span className="text-sm font-medium">{group.date}</span>
                        </div>
                      )}
                  {group.messages.map((msg) => {
                    if (msg.isDeleted) return null;

                    return (
                      <div
                        key={msg.id}
                        className={cn("flex items-end gap-2 my-2", msg.isOwn ? "justify-end" : "justify-start")}
                        data-message-id={msg.id}
                        data-is-own={msg.isOwn.toString()}
                        onContextMenu={(e) => openContextMenu(msg, e)}
                        onTouchStart={(e) => {
                          longPressTimer.current = setTimeout(() => openContextMenu(msg, e), 500);
                        }}
                        onTouchEnd={() => {
                          if (longPressTimer.current) clearTimeout(longPressTimer.current);
                        }}
                        onTouchMove={() => {
                          if (longPressTimer.current) clearTimeout(longPressTimer.current);
                        }}
                      >
                        {!msg.isOwn && (
                          <Avatar className="h-6 w-6 mb-0">
                            <AvatarImage src={selectedChatObj?.avatar} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {(selectedChatObj?.name || "F").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            "max-w-[75%] sm:max-w-xs md:max-w-sm lg:max-w-md flex flex-col",
                            msg.isOwn
                              ? "bg-purple-600 text-white rounded-tl-md rounded-bl-md rounded-tr-[1rem] rounded-br-none"
                              : "bg-slate-700 text-white rounded-tr-md rounded-br-md rounded-tl-[1rem] rounded-bl-none",
                            msg.mediaType?.startsWith('image/') ? "p-0" : "px-3 py-1.5 md:px-4 md:py-2"
                          )}
                        >
                          {msg.replyTo && !msg.replyTo.isDeleted && (
                            <div className="border-l-4 border-purple-500 pl-2 mb-2 bg-slate-700/20 p-2 rounded text-xs text-slate-300">
                              <p className="font-medium text-slate-200">{msg.replyTo.sender.username}</p>
                              <p className="truncate">
                                {msg.replyTo.content || (msg.replyTo.mediaType?.startsWith('image/') ? "Image" : "File")}
                              </p>
                            </div>
                          )}

                          {msg.mediaUrl && msg.mediaType?.startsWith('image/') ? (
                            <div className="relative overflow-hidden">
                              <img
                                src={msg.mediaUrl}
                                alt="sent"
                                className="w-full h-64 object-cover cursor-pointer"
                                onClick={() => handleImageClick(msg.mediaUrl!)}
                              />
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                                <span className="text-xs text-white">{msg.timestamp}</span>
                                {msg.isOwn && (
                                  msg.status === 'read' ? <IoCheckmarkDone className="w-4 h-4 text-blue-300" /> : <Check className="w-4 h-4 text-purple-200" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.mediaUrl && (
                                <div className="mb-2">
                                  <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg border border-slate-600/50 p-2">
                                    <div
                                      className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center cursor-pointer"
                                      onClick={() => window.open(msg.mediaUrl!, "_blank")}
                                    >
                                      {getFileIcon(msg.mediaType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-white truncate">
                                        {(() => {
                                          const name = msg.mediaUrl?.split("/").pop() || "File";
                                          try { return decodeURIComponent(name); } catch { return name; }
                                        })()}
                                      </p>
                                      <p className="text-xs text-slate-400">Click to download</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {msg.content && <p className="text-sm">{msg.content}</p>}
                              <div className="flex items-center justify-end mt-1 gap-1">
                                {msg.isEdited && <span className="text-[0.6rem] text-slate-400">edited</span>}
                                <span className={cn("text-[0.7rem]", msg.isOwn ? "text-purple-200" : "text-slate-400")}>
                                  {msg.timestamp}
                                </span>
                                {msg.isOwn && (
                                  msg.status === 'read' ? <IoCheckmarkDone className="w-5 h-4 text-blue-400" /> : <Check className="w-5 h-4 text-purple-200" />
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {!msg.isOwn && <div className="w-8 flex-shrink-0" />}
                      </div>
                    );
                  })}
                    </div>
                  ))
                )}
                <div ref={lastMessageRef} />
              </div>
            </ScrollArea>

            {showScrollDownButton && (
              <div className="absolute bottom-20 md:bottom-24 right-4 z-50">
                <Button
                  onClick={handleScrollDown}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 md:p-3 shadow-lg animate-bounce"
                  size="icon"
                >
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm sticky bottom-0 z-10">


              {(replyingTo || editingMessage) && (
                <div className="mb-2 p-2 bg-slate-700/30 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm text-purple-400">{replyingTo ? 'Replying to' : 'Editing'}:</p>
                    <p className="text-xs text-slate-300 truncate max-w-xs">
                      {replyingTo?.content || editingMessage?.content || 'Message'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setReplyingTo(null);
                      setEditingMessage(null);
                      setMessage('');
                    }}
                  >
                    ✕
                  </Button>
                </div>
              )}

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
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 flex-shrink-0"
                  onClick={handlePaperclipClick}
                >
                  <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                />
                <div className="flex-1 relative min-w-0">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 pr-10 md:pr-12 text-sm md:text-base"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white hidden sm:flex"
                  >
                    <Smile className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0">
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
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

      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-800 p-4 rounded-lg">
            <h3 className="text-white mb-2">Delete message?</h3>
            {contextMenu.message?.isOwn && (
              <label className="flex items-center text-slate-300">
                <input
                  type="checkbox"
                  checked={deleteForEveryone}
                  onChange={(e) => setDeleteForEveryone(e.target.checked)}
                  className="mr-2"
                />
                Delete for {selectedChatObj?.name} too
              </label>
            )}
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="ghost" onClick={() => { setShowDeleteConfirm(false); setDeleteForEveryone(false); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram-Style Context Menu */}
      {contextMenu.visible && contextMenu.message && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-slate-800 rounded-lg shadow-xl py-1 w-44 border border-slate-700"
          style={{ left: 0, top: 0 }}
        >
          <button
            onClick={() => {
              setReplyingTo(contextMenu.message);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-slate-700 w-full text-left transition"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>

          {!contextMenu.message.isDeleted && (
            <button
              onClick={() => {
                handleCopyMessage(contextMenu.message!);
                setContextMenu({ ...contextMenu, visible: false });
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-slate-700 w-full text-left transition"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          )}

          {contextMenu.message && contextMenu.message.isOwn && !contextMenu.message.isDeleted && (
            <button
              onClick={() => {
                const msg = contextMenu.message;
                if (msg) {
                  setEditingMessage(msg);
                  setMessage(msg.content);
                }
                setContextMenu({ ...contextMenu, visible: false });
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-slate-700 w-full text-left transition"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}

          <button
            onClick={() => {
              setShowDeleteConfirm(true);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 w-full text-left transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

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