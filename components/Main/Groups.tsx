"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Search, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface GroupsProps {
  onGroupSelect: (groupId: string) => void
  selectedGroup?: string | null
}

export function Groups({ onGroupSelect, selectedGroup }: GroupsProps) {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [newGroupAvatarFile, setNewGroupAvatarFile] = useState<File | null>(null)
  const [newGroupAvatarPreview, setNewGroupAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchGroups()
    fetchAvailableUsers()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('authToken')
      const response = await fetch('https://klyra-back.onrender.com/v1/groups', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const token = sessionStorage.getItem('authToken')
      const response = await fetch('https://klyra-back.onrender.com/v1/users', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const currentUser = sessionStorage.getItem("currentUser") 
          ? JSON.parse(sessionStorage.getItem("currentUser")!)
          : null
        
        // Filter out current user
        const filteredUsers = data.users?.filter((user: any) => user.id !== currentUser?.id) || []
        setAvailableUsers(filteredUsers)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedUsers.length === 0) return

    try {
      const token = sessionStorage.getItem('authToken')
      const formData = new FormData()
      formData.append("name", newGroupName)
      formData.append("userIds", JSON.stringify(selectedUsers))
      if (newGroupAvatarFile) {
        formData.append("avatar", newGroupAvatarFile)
      }

      const response = await fetch('https://klyra-back.onrender.com/v1/groups', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(prev => [data.group, ...prev])
        setShowCreateDialog(false)
        setNewGroupName("")
        setSelectedUsers([])
        setNewGroupAvatarFile(null)
        setNewGroupAvatarPreview(null)
        onGroupSelect(data.group.id)
      }
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading groups...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Groups</h2>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 text-white"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No groups yet</p>
              <p className="text-sm mt-1">Create a group to start chatting</p>
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div
                key={group.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1",
                  selectedGroup === group.id
                    ? "bg-blue-600/20 border border-blue-500/30"
                    : "hover:bg-slate-700/30"
                )}
                onClick={() => onGroupSelect(group.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      <Users className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium truncate">{group.name}</h4>
                      {group.lastMessage?.createdAt && (
                        <span className="text-xs text-slate-400">
                          {new Date(group.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    {group.lastMessage && (
                      <p className="text-sm text-slate-400 truncate">
                        {group.lastMessage.sender?.username || 'Someone'}: {group.lastMessage.content || 'Media'}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">
                        {group.members?.length || 0} members
                      </span>
                      {(group.unreadCount || group.unreadCount === 0) && group.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Custom Dialog Modal */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Create New Group</h3>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Group Name</label>
                  <Input
                    placeholder="Enter group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Group Photo (optional)</label>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={newGroupAvatarPreview || "/placeholder.svg"}
                        alt="New group avatar preview"
                      />
                      <AvatarFallback className="bg-blue-600 text-white">
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-slate-300"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setNewGroupAvatarFile(file)
                          if (file) setNewGroupAvatarPreview(URL.createObjectURL(file))
                          else setNewGroupAvatarPreview(null)
                        }}
                      />
                      {newGroupAvatarFile && (
                        <p className="text-xs text-slate-400 mt-1 truncate">{newGroupAvatarFile.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Add Members</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {availableUsers.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No users available to add</p>
                    ) : (
                      availableUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3 min-w-0">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-purple-600 text-white">
                                {user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{user.fullname}</p>
                              <p className="text-slate-400 text-xs truncate">@{user.username}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={selectedUsers.includes(user.id) ? "default" : "outline"}
                            onClick={() => {
                              setSelectedUsers(prev =>
                                prev.includes(user.id)
                                  ? prev.filter(id => id !== user.id)
                                  : [...prev, user.id]
                              )
                            }}
                          >
                            {selectedUsers.includes(user.id) ? "Added" : "Add"}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700/50">
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || selectedUsers.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Create Group ({selectedUsers.length + 1} members)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}