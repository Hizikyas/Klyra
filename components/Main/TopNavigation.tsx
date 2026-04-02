"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, Bell, Settings, LogOut, Menu, Loader2, CheckCheck } from "lucide-react"
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
import { cn } from "@/lib/utils"
import Image from "next/image"

interface TopNavigationProps {
  onMobileSidebarToggle?: () => void
  onSettingsClick?: () => void
}

export function TopNavigation({ onMobileSidebarToggle, onSettingsClick }: TopNavigationProps) {
  const currentUser = sessionStorage.getItem("currentUser") ? JSON.parse(sessionStorage.getItem("currentUser")!) : null
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [unreadSendersCount, setUnreadSendersCount] = useState(0)

  // Listen for unread count updates
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<number>) => setUnreadSendersCount(e.detail)
    window.addEventListener('updateUnreadCount', handleUpdate as EventListener)
    return () => window.removeEventListener('updateUnreadCount', handleUpdate as EventListener)
  }, [])

  // Debounce the query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // Fetch users (then filter client-side for now)
  useEffect(() => {
    if (!debouncedQuery) {
      setUsers([])
      setIsLoading(false)
      return
    }
    let isCancelled = false
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        // Narrow payload; backend supports fields/limit via AppFeatures
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://klyra-back.onrender.com"}/v1/users?limit=20&fields=id,fullname,username,avatar`)
        const data = await res.json()
        if (isCancelled) return
        const q = debouncedQuery.toLowerCase()
        const filtered = (data?.users || []).filter((u: any) =>
          (u.username && String(u.username).toLowerCase().includes(q)) ||
          (u.fullname && String(u.fullname).toLowerCase().includes(q))
        )
        setUsers(filtered)
      } catch (e) {
        setUsers([])
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }
    fetchUsers()
    return () => {
      isCancelled = true
    }
  }, [debouncedQuery])

  // Close on outside click / escape
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("keydown", onDown)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onDown)
      document.removeEventListener("mousedown", onClick)
    }
  }, [])

  const highlightMatch = (text: string, q: string) => {
    if (!text) return null
    if (!q) return text
    const i = text.toLowerCase().indexOf(q.toLowerCase())
    if (i === -1) return text
    const before = text.slice(0, i)
    const match = text.slice(i, i + q.length)
    const after = text.slice(i + q.length)
    return (
      <>
        {before}
        <span className="font-semibold text-white">{match}</span>
        {after}
      </>
    )
  }

  const showDropdown = isOpen && (isLoading || users.length > 0)

  const handleSelectUser = (u: any) => {
    // Prevent adding self to messages sidebar
    if (u?.id && (currentUser?.id === u.id || currentUser?.username === u.username)) {
      setIsOpen(false)
      setShowMobileSearch(false)
      return
    }
    // Dispatch event to add chat to sidebar
    window.dispatchEvent(new CustomEvent("klyra:addChatFromSearch", { detail: {
      id: u.id,
      name: u.fullname || u.username,
      username: u.username,
      avatar: u.avatar || null,
      lastMessage: u.lastMessage || null,
      isRead: u.lastMessage ? !!u.lastMessage?.isRead : undefined,
    }}))
    setIsOpen(false)
    setShowMobileSearch(false)
  }

  return (
    <>
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden" onClick={() => setShowMobileSearch(false)}>
          <div className="md:hidden fixed top-16 left-0 right-0 z-[101] p-4 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50" style={{ zIndex: 102 }} onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-w-md mx-auto" ref={containerRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search users or chats..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsOpen(true)
                  setHasSubmitted(false)
                }}
                onFocus={() => query && setIsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setHasSubmitted(true)
                    setIsOpen(true)
                  }
                }}
                className="pl-10 pr-20 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white hover:bg-slate-700/50"
                onClick={() => {
                  if (!query.trim()) return
                  setHasSubmitted(true)
                  setIsOpen(true)
                }}
              >
                Search
              </Button>
              {(showDropdown || (isOpen && hasSubmitted && !isLoading)) && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-800/95 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[70]">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6 text-slate-300">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Searching…</span>
                    </div>
                  ) : users.length > 0 ? (
                    <ul className="max-h-80 overflow-auto divide-y divide-slate-700">
                      {users.map((u) => (
                        <li key={u.id} className="p-3 hover:bg-slate-700/50 cursor-pointer" onClick={() => handleSelectUser(u)}>
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-9 w-9 shrink-0">
                              {u?.avatar ? (
                                <AvatarImage src={u.avatar} alt={u.fullname || u.username} />
                              ) : (
                                <AvatarFallback className="bg-purple-600 text-white">
                                  {(u.username || u.fullname || "U").charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-200 truncate">
                                {u.fullname ? (
                                  <span>{highlightMatch(u.fullname, debouncedQuery)}</span>
                                ) : (
                                  <span>{highlightMatch(u.username, debouncedQuery)}</span>
                                )}
                              </div>
                              {u.username && (
                                <div className="text-xs text-slate-400 truncate">@{highlightMatch(u.username, debouncedQuery)}</div>
                              )}
                              {u.lastMessage && (
                                <div className="flex items-center justify-between mt-1">
                                  <div className="text-xs text-slate-400 truncate">
                                    {highlightMatch(u.lastMessage?.content || "", debouncedQuery)}
                                  </div>
                                  <div className={cn("ml-2", u.lastMessage?.isRead ? "text-blue-400" : "text-slate-400")}>
                                    <CheckCheck className="h-4 w-4" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : hasSubmitted && debouncedQuery ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                      <Image src="/icons/no_data.svg" alt="No results" width={112} height={112} className="opacity-80 mb-3" />
                      <div className="text-sm">No results found for <span className="font-semibold text-white">"{query.trim()}"</span>.</div>
                      <div className="text-xs text-slate-400 mt-1">Try a different name or username.</div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

      <div className={cn("hidden md:flex flex-1 max-w-md mx-8", showMobileSearch && "md:hidden")}>
        <div className="relative w-full" ref={containerRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search users or chats..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              setHasSubmitted(false)
            }}
            onFocus={() => query && setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setHasSubmitted(true)
                setIsOpen(true)
              }
            }}
            className="pl-10 pr-20 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white hover:bg-slate-700/50"
            onClick={() => {
              if (!query.trim()) return
              setHasSubmitted(true)
              setIsOpen(true)
            }}
          >
            Search
          </Button>
          {(showDropdown || (isOpen && hasSubmitted && !isLoading)) && (
            <div className="absolute left-0 right-0 mt-2 bg-slate-800/95 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[70]">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-slate-300">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Searching…</span>
                </div>
              ) : users.length > 0 ? (
                <ul className="max-h-80 overflow-auto divide-y divide-slate-700">
                  {users.map((u) => (
                    <li key={u.id} className="p-3 hover:bg-slate-700/50 cursor-pointer" onClick={() => handleSelectUser(u)}>
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          {u?.avatar ? (
                            <AvatarImage src={u.avatar} alt={u.fullname || u.username} />
                          ) : (
                            <AvatarFallback className="bg-purple-600 text-white">
                              {(u.username || u.fullname || "U").charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-200 truncate">
                            {u.fullname ? (
                              <span>{highlightMatch(u.fullname, debouncedQuery)}</span>
                            ) : (
                              <span>{highlightMatch(u.username, debouncedQuery)}</span>
                            )}
                          </div>
                          {u.username && (
                            <div className="text-xs text-slate-400 truncate">@{highlightMatch(u.username, debouncedQuery)}</div>
                          )}
                          {u.lastMessage && (
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-xs text-slate-400 truncate">
                                {highlightMatch(u.lastMessage?.content || "", debouncedQuery)}
                              </div>
                              <div className={cn("ml-2", u.lastMessage?.isRead ? "text-blue-400" : "text-slate-400")}> 
                                <CheckCheck className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : hasSubmitted && debouncedQuery ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                  <Image src="/icons/no_data.svg" alt="No results" width={112} height={112} className="opacity-80 mb-3" />
                  <div className="text-sm">No results found for <span className="font-semibold text-white">“{query.trim()}”</span>.</div>
                  <div className="text-xs text-slate-400 mt-1">Try a different name or username.</div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>



      <div className="flex items-center space-x-2 lg:space-x-4">

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-300 hover:text-white hover:bg-slate-700/50"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50 relative">
          <Bell className="h-5 w-5" />
          {unreadSendersCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
              {unreadSendersCount}
            </span>
          )}
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
              <DropdownMenuItem 
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.removeItem("authToken");
                  window.location.href = "/";
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    </>
  )
}







