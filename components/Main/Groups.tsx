"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

  useEffect(() => {
    fetchGroups()
    fetchAvailableUsers()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('authToken')
      const response = await fetch('http://localhost:4000/v1/groups', {
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
      const response = await fetch('http://localhost:4000/v1/users', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedUsers.length === 0) return

    try {
      const token = sessionStorage.getItem('authToken')
      const response = await fetch('http://localhost:4000/v1/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGroupName,
          userIds: selectedUsers,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(prev => [data.group, ...prev])
        setShowCreateDialog(false)
        setNewGroupName("")
        setSelectedUsers([])
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
        <div className="text-slate-400">Loading groups...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Groups</h2>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Add Members</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white text-sm">{user.fullname}</p>
                            <p className="text-slate-400 text-xs">@{user.username}</p>
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
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || selectedUsers.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Group ({selectedUsers.length + 1} members)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                      {group.messages?.[0]?.createdAt && (
                        <span className="text-xs text-slate-400">
                          {new Date(group.messages[0].createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    {group.messages?.[0] && (
                      <p className="text-sm text-slate-400 truncate">
                        {group.messages[0].sender?.username}: {group.messages[0].content || 'Media'}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">
                        {group.members?.length || 0} members
                      </span>
                      {group.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
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
    </div>
  )
}