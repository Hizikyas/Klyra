"use client";

import { useEffect, useState, useRef } from "react";
import {
  Video,
  Phone,
  ArrowLeft,
  Loader2,
  Check,
  ChevronDown,
  Reply,
  Edit,
  Trash2,
  Copy,
  Users,
  UserPlus,
  UserMinus,
  MoreVertical,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { IoCheckmarkDone } from "react-icons/io5";
import { FaFile, FaFilePdf, FaFileWord, FaFileExcel } from "react-icons/fa";
import Modal from "../ui/modalIMG";
import { RightSidebar } from "./RightSidebar";
import { GroupSidebar } from "./GroupSidebar";
import { ChatMessageList } from "./chatSection/ChatMessageList";
import { ChatComposer } from "./chatSection/ChatComposer";

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
  groupMembers?: any[];
  admins?: string[];
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
  senderId: string;
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
  groupId?: string;
}

interface GroupInfo {
  id: string;
  name: string;
  avatar?: string;
  members: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      fullname: string;
      avatar?: string;
      online?: boolean;
      lastSeen?: string;
    };
    isAdmin?: boolean;
    status?: "PENDING" | "ACTIVE";
  }>;
  admins?: string[];
  createdAt: string;
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
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [showRightSidebarModal, setShowRightSidebarModal] = useState(false);
  const [showGroupSidebarModal, setShowGroupSidebarModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteForEveryone, setDeleteForEveryone] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, { isOnline: boolean; lastSeen?: string }>>({});
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const chatsRef = useRef<ChatItem[]>([]);

  const [contextMenu, setContextMenu] = useState<{
    message: Message | null;
    x: number;
    y: number;
    visible: boolean;
  }>({ message: null, x: 0, y: 0, visible: false });
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedChatKey = normalizeId(selectedChat);
  const selectedChatObj = chats.find((c) => c.id === selectedChat);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("currentUser");
      setCurrentUser(raw ? JSON.parse(raw) : {});
    } catch {
      setCurrentUser({});
    }
  }, []);

  useEffect(() => {
    if (!selectedChatKey || !selectedChatObj?.isGroup || !currentUser?.id) return;

    const fetchGroupInfo = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`http://localhost:4000/v1/groups/${selectedChatKey}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGroupInfo(data.group);
          
          const isUserAdmin = data.group.admins?.includes(currentUser.id) || 
                             data.group.members?.some((m: any) => 
                               m.userId === currentUser.id && m.isAdmin);
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error('Failed to fetch group info:', error);
      }
    };

    fetchGroupInfo();
  }, [selectedChatKey, selectedChatObj?.isGroup, currentUser?.id]);

  const fetchAvailableUsers = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:4000/v1/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const existingMemberIds = groupInfo?.members.map(m => m.user.id) || [];
        const available = data.users.filter((user: any) => 
          !existingMemberIds.includes(user.id) && user.id !== currentUser.id
        );
        setAvailableUsers(available);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

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
      online?: boolean;
      lastSeen?: string;
      isGroup?: boolean;
      groupMembers?: any[];
      admins?: string[];
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
          isGroup: opts.isGroup ?? existing.isGroup,
          groupMembers: opts.groupMembers ?? existing.groupMembers,
          admins: opts.admins ?? existing.admins,
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
        isGroup: opts.isGroup ?? false,
        groupMembers: opts.groupMembers,
        admins: opts.admins,
      };
      return [created, ...prev];
    });
  };

  useEffect(() => {
    const loadConversations = async () => {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
      if (!token) return;

      try {
        const [dmRes, groupsRes] = await Promise.all([
          fetch('http://localhost:4000/v1/messages/conversations', {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }),
          fetch('http://localhost:4000/v1/groups', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const dmChats: ChatItem[] = [];
        const groupChats: ChatItem[] = [];

        if (dmRes.ok) {
          const dmData = await dmRes.json();
          if (Array.isArray(dmData?.conversations)) {
            dmChats.push(...dmData.conversations
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
                  isGroup: false,
                };
              })
              .filter(Boolean) as ChatItem[]);
          }
        }

        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          if (Array.isArray(groupsData?.groups)) {
            groupChats.push(...groupsData.groups.map((group: any) => ({
              id: group.id,
              name: group.name,
              lastMessage: group.lastMessage?.content || (group.lastMessage?.mediaUrl ? 'Media' : ''),
              timestamp: group.lastMessage?.createdAt ? formatTimestamp(group.lastMessage.createdAt) : '',
              unread: group.unreadCount || 0,
              avatar: group.avatar,
              online: true,
              isGroup: true,
              groupMembers: group.members,
              admins: group.admins,
            })));
          }
        }

        setChats([...groupChats, ...dmChats]);
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
    chatsRef.current = chats;
  }, [chats]);

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
        const isGroup = selectedChatObj?.isGroup;
        const url = new URL(isGroup 
          ? `http://localhost:4000/v1/groups/${chatKey}/messages`
          : 'http://localhost:4000/v1/messages'
        );
        
        if (!isGroup) {
          url.searchParams.set('recipientId', chatKey);
        }

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        const messagesArray = isGroup ? data?.messages || [] : data?.messages || [];
        
        if (Array.isArray(messagesArray)) {
          const mapped: Message[] = messagesArray.map((m: any) => ({
            id: m.id,
            sender: m.senderId === currentUser.id ? 'You' : m.sender?.username || 'User',
            senderId: m.senderId,
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
            groupId: m.groupId,
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
              name: selectedChatObj?.name,
              avatar: selectedChatObj?.avatar,
              lastMessage: last.content || (last.mediaUrl ? (last.mediaType?.startsWith('image/') ? 'Image' : 'File') : ''),
              timestamp: last.timestamp,
              resetUnread: true,
              preserveOrder: true,
              isFromCurrentUser: last.isOwn,
              messageStatus: last.status === 'sending' ? 'sent' : (last.status === 'read' ? 'read' : 'sent'),
            });
          }
        }
      } catch (e) {
        console.error('Failed to load messages', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat, currentUser?.id]);

  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    // Presence updates for friends: keep `onlineStatus` in sync
    const handleOnlineUsers = (userIds: string[]) => {
      setOnlineStatus((prev) => {
        const next = { ...prev };
        userIds.forEach((id) => {
          next[String(id)] = { isOnline: true };
        });
        return next;
      });
    };

    const handleUserOnline = (data: { userId: string }) => {
      const userId = String(data?.userId);
      if (!userId) return;
      setOnlineStatus((prev) => ({
        ...prev,
        [userId]: { isOnline: true },
      }));
    };

    const handleUserOffline = (data: { userId: string; lastSeen?: string }) => {
      const userId = String(data?.userId);
      if (!userId) return;
      setOnlineStatus((prev) => ({
        ...prev,
        [userId]: { isOnline: false, lastSeen: data?.lastSeen },
      }));
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    const handleGroupMessage = (newMessage: any) => {
      if (newMessage.groupId !== selectedChat) return;
      
      const newMessageObj: Message = {
        id: newMessage.id,
        sender: newMessage.senderId === currentUser.id ? 'You' : newMessage.sender?.username || 'User',
        senderId: newMessage.senderId,
        content: newMessage.content || '',
        mediaUrl: newMessage.mediaUrl || undefined,
        mediaType: newMessage.mediaType || undefined,
        timestamp: formatTimestamp(newMessage.createdAt),
        createdAt: newMessage.createdAt,
        isOwn: newMessage.senderId === currentUser.id,
        isRead: newMessage.isRead,
        status: newMessage.senderId === currentUser.id ? (newMessage.isRead ? 'read' as const : 'sent' as const) : undefined,
        isEdited: newMessage.isEdited,
        isDeleted: newMessage.isDeleted,
        groupId: newMessage.groupId,
        replyTo: newMessage.replyTo ? {
          id: newMessage.replyTo.id,
          content: newMessage.replyTo.content,
          sender: { username: newMessage.replyTo.sender?.username || 'User' },
          mediaUrl: newMessage.replyTo.mediaUrl,
          mediaType: newMessage.replyTo.mediaType,
          isDeleted: newMessage.replyTo.isDeleted,
        } : undefined,
      };

      setMessages(prev => [...prev, newMessageObj]);
      const chatKey = String(selectedChat);
      setMessagesCache(prev => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), newMessageObj]
      }));
    };

    const handleGroupMemberAdded = (data: { groupId: string; member: any }) => {
      if (data.groupId === selectedChat) {
        setGroupInfo(prev => prev ? {
          ...prev,
          members: [...prev.members, data.member]
        } : null);
      }
    };

    const handleGroupMemberRemoved = (data: { groupId: string; userId: string }) => {
      if (data.groupId === selectedChat) {
        setGroupInfo(prev => prev ? {
          ...prev,
          members: prev.members.filter(m => m.user.id !== data.userId)
        } : null);
        
        if (data.userId === currentUser.id) {
          onChatSelect("");
        }
      }
    };

    const handleGroupUpdated = (data: { groupId: string; group: GroupInfo }) => {
      if (data.groupId !== selectedChat) return;

      setGroupInfo(data.group);
      setChats((prev) =>
        prev.map((c) =>
          c.id === String(data.groupId)
            ? { ...c, name: data.group.name, avatar: data.group.avatar }
            : c
        )
      );
    };

    socket.on('groupMessage', handleGroupMessage);
    socket.on('groupMemberAdded', handleGroupMemberAdded);
    socket.on('groupMemberRemoved', handleGroupMemberRemoved);
    socket.on('groupUpdated', handleGroupUpdated);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off('groupMessage', handleGroupMessage);
      socket.off('groupMemberAdded', handleGroupMemberAdded);
      socket.off('groupMemberRemoved', handleGroupMemberRemoved);
      socket.off('groupUpdated', handleGroupUpdated);
    };
  }, [socket, currentUser?.id, selectedChat]);

  const handleSendMessage = async () => {
    const chatKey = selectedChatKey;
    if ((!message.trim() && !selectedFile) || !chatKey) return;

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    if (!token) return;

    try {
      const formData = new FormData();
      const isGroup = selectedChatObj?.isGroup;

      if (!editingMessage) {
        formData.append('content', message.trim());
        
        if (isGroup) {
          formData.append('groupId', chatKey);
        } else {
          formData.append('recipientId', chatKey);
        }
        
        if (replyingTo) {
          formData.append('replyToId', replyingTo.id);
        }
        if (selectedFile) {
          formData.append('media', selectedFile);
        }

        const endpoint = isGroup 
          ? 'http://localhost:4000/v1/groups/messages'
          : 'http://localhost:4000/v1/messages';

        const res = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (data?.message) {
          const m = data.message;
          const newMessageObj: Message = {
            id: m.id,
            sender: 'You',
            senderId: currentUser.id,
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
            groupId: m.groupId,
            replyTo: m.replyTo ? {
              id: m.replyTo.id,
              content: m.replyTo.content,
              sender: { username: m.replyTo.sender?.username || 'User' },
              mediaUrl: m.replyTo.mediaUrl,
              mediaType: m.replyTo.mediaType,
              isDeleted: m.replyTo.isDeleted,
            } : undefined,
          };

          setMessages(prev => [...prev, newMessageObj]);
          setMessagesCache(prev => ({
            ...prev,
            [chatKey]: [...(prev[chatKey] || []), newMessageObj]
          }));
          setMessage('');
          setSelectedFile(null);
          setReplyingTo(null);
        }
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedChatKey || !selectedUsers.length) return;
    
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/v1/groups/${selectedChatKey}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      if (response.ok) {
        setShowAddMembersModal(false);
        setSelectedUsers([]);
        if (selectedChatObj?.isGroup) {
          const groupRes = await fetch(`http://localhost:4000/v1/groups/${selectedChatKey}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (groupRes.ok) {
            const data = await groupRes.json();
            setGroupInfo(data.group);
          }
        }
      }
    } catch (error) {
      console.error('Failed to add members:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedChatKey || !isAdmin) return;
    
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/v1/groups/${selectedChatKey}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setGroupInfo(prev => prev ? {
          ...prev,
          members: prev.members.filter(m => m.user.id !== userId)
        } : null);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedChatKey) return;
    
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/v1/groups/${selectedChatKey}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        onChatSelect("");
      }
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const handleBackToList = () => {
    setLoading(false);
    setMessages([]);
    onChatSelect("");
  };

  const handleImageClick = (imageUrl: string) => {
    setModalImage(imageUrl);
    setShowModal(true);
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

  const openContextMenu = (msg: Message, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setContextMenu({ message: msg, x, y, visible: true });
  };

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
        setMessages((prev) => prev.filter((msg) => msg.id !== contextMenu.message!.id));
        setMessagesCache(prev => ({
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

  const renderGroupHeader = () => {
    if (!selectedChatObj?.isGroup || !groupInfo) return null;

    const onlineCount = groupInfo.members.filter(m => 
      onlineStatus[m.user.id]?.isOnline || m.user.online
    ).length;

    return (
      <div className="flex items-center space-x-2 md:space-x-3 group text-left min-w-0">
        <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
          <AvatarImage
            src={groupInfo?.avatar || selectedChatObj?.avatar || "/placeholder.svg"}
            alt={groupInfo?.name || selectedChatObj?.name || "Group"}
          />
          <AvatarFallback className="bg-blue-600 text-white text-xs md:text-sm">
            <Users className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm md:text-base truncate">
              {groupInfo?.name || selectedChatObj?.name || "Group"}
            </h3>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
              {groupInfo.members.length} members
            </span>
          </div>
          <p className="text-xs md:text-sm text-green-400">
            {onlineCount} online • {groupInfo.members.length - onlineCount} offline
          </p>
        </div>
      </div>
    );
  };

  const renderDMHeader = () => {
    const status = onlineStatus[selectedChatKey || ''] || { 
      isOnline: selectedChatObj?.online || false, 
      lastSeen: selectedChatObj?.lastSeen 
    };

    return (
      <div className="flex items-center space-x-2 md:space-x-3 group text-left min-w-0">
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
          <h3 className="text-white font-semibold text-sm md:text-base truncate">
            {selectedChatObj?.name || "Conversation"}
          </h3>
          {status.isOnline ? (
            <p className="text-xs md:text-sm text-green-400">Online</p>
          ) : (
            <p className="text-xs text-slate-400 truncate">
              {status.lastSeen ? formatLastSeen(status.lastSeen) : "Offline"}
            </p>
          )}
        </div>
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <div className={cn(
        "w-full md:w-80 bg-slate-800/20 backdrop-blur-sm border-r border-slate-700/50 relative z-10",
        isMobile ? (selectedChat ? "hidden" : "w-full") : "w-full md:w-80"
      )}>
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] scrollbar-custom">
          <div className="p-2">
            {chats.length === 0 ? (
              <div className="p-4 text-slate-400 text-center">
                <img src="/icons/add_user.svg" alt="No messages" className="h-24 w-24 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs mt-1">Start a chat or create a group.</p>
              </div>
            ) : (
              chats.map((chat) => {
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
                        ? chat.isGroup 
                          ? "bg-blue-600/20 border border-blue-500/30"
                          : "bg-purple-600/20 border border-purple-500/30"
                        : "hover:bg-slate-700/30"
                    )}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                          <AvatarFallback className={cn(
                            "text-white",
                            chat.isGroup ? "bg-blue-600" : "bg-purple-600"
                          )}>
                            {chat.isGroup ? (
                              <Users className="h-5 w-5" />
                            ) : (
                              chat.name.split(" ").map((n) => n[0]).join("")
                            )}
                          </AvatarFallback>
                        </Avatar>

                        {!chat.isGroup && (
                          <div
                            className={cn(
                              "absolute bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800",
                              status.isOnline ? "bg-green-500" : "bg-slate-500"
                            )}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium leading-tight truncate">{chat.name}</h4>
                            {chat.isGroup && (
                              <span className="text-xs text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">
                                Group
                              </span>
                            )}
                          </div>
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
                              <span className={cn(
                                "text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2",
                                chat.isGroup 
                                  ? "bg-blue-600 text-white"
                                  : "bg-purple-600 text-white"
                              )}>
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

      <div className={cn(
        "flex-1 flex flex-col bg-slate-900/10 relative w-full",
        isMobile ? (selectedChat ? "w-full" : "hidden") : "flex-1"
      )}>
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
                    if (selectedChatObj?.isGroup) {
                      setShowGroupSidebarModal(true);
                    } else {
                      if (isMobile || window.innerWidth < 768) {
                        setShowRightSidebarModal(true);
                      } else {
                        onToggleRightPanel?.();
                      }
                    }
                  }}
                  className="flex-1 text-left"
                >
                  {selectedChatObj?.isGroup ? renderGroupHeader() : renderDMHeader()}
                </button>
                
                <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                  {selectedChatObj?.isGroup && isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                          <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem 
                          onClick={() => {
                            fetchAvailableUsers();
                            setShowAddMembersModal(true);
                          }}
                          className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Members
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={handleLeaveGroup}
                          className="text-red-400 hover:bg-slate-700 cursor-pointer"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Leave Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {!selectedChatObj?.isGroup && (
                    <>
                      <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50 hidden sm:flex">
                        <Phone className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50 hidden sm:flex">
                        <Video className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </>
                  )}
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
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {selectedChatObj?.isGroup ? 'No group messages yet' : 'No conversation yet'}
                    </h3>
                    <p className="text-slate-400 mb-4 max-w-sm">
                      {selectedChatObj?.isGroup 
                        ? 'Start the conversation in this group.'
                        : `Start your first conversation with ${selectedChatObj?.name || 'this user'}.`}
                    </p>
                    {selectedChatObj?.isGroup && groupInfo && (
                      <div className="text-sm text-slate-500">
                        <p>{groupInfo.members.length} members in this group</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <ChatMessageList
                    groupedMessages={groupedMessages}
                    selectedChatObj={selectedChatObj}
                    groupInfo={groupInfo}
                    getFileIcon={getFileIcon}
                    onImageClick={handleImageClick}
                    onOpenContextMenu={openContextMenu}
                  />
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

            <ChatComposer
              isGroup={!!selectedChatObj?.isGroup}
              message={message}
              onMessageChange={(v) => setMessage(v)}
              onSendMessage={handleSendMessage}
              replyingTo={replyingTo}
              editingMessage={editingMessage}
              onCancelReplyOrEdit={() => {
                setReplyingTo(null);
                setEditingMessage(null);
                setMessage("");
              }}
              selectedFile={selectedFile}
              onSelectedFileChange={setSelectedFile}
              getFileIcon={getFileIcon}
            />
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
              <p>Choose a chat or group from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showAddMembersModal && (
        <Modal onClose={() => setShowAddMembersModal(false)}>
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Add Members to Group</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {availableUsers.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No users available to add</p>
              ) : (
                availableUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{user.fullname}</p>
                        <p className="text-slate-400 text-sm">@{user.username}</p>
                      </div>
                    </div>
                    <Button
                      variant={selectedUsers.includes(user.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedUsers(prev =>
                          prev.includes(user.id)
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        );
                      }}
                    >
                      {selectedUsers.includes(user.id) ? "Selected" : "Select"}
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setShowAddMembersModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddMembers} 
                disabled={!selectedUsers.length}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Selected ({selectedUsers.length})
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
                Delete for {selectedChatObj?.isGroup ? 'everyone' : selectedChatObj?.name} too
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

      {showGroupSidebarModal && (
        <Modal onClose={() => setShowGroupSidebarModal(false)}>
          <div className="w-full max-w-md mx-auto">
            <GroupSidebar
              groupId={selectedChatKey}
              onClose={() => setShowGroupSidebarModal(false)}
              isAdmin={isAdmin}
              onRemoveMember={handleRemoveMember}
              onLeaveGroup={handleLeaveGroup}
              onGroupUpdated={(updatedGroup) => {
                setGroupInfo(updatedGroup);
                setChats((prev) =>
                  prev.map((c) =>
                    c.id === selectedChatKey
                      ? { ...c, name: updatedGroup.name, avatar: updatedGroup.avatar }
                      : c
                  )
                );
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
