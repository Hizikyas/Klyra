 "use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Users, Crown, Edit2, Image as ImageIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupSidebarProps {
  groupId: string | null;
  collapsed?: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onRemoveMember?: (userId: string) => void;
  onLeaveGroup?: () => void;
  onGroupUpdated?: (group: GroupDetails) => void;
}

interface GroupMember {
  id: string;
  userId: string;
  isAdmin?: boolean;
  user: {
    id: string;
    username: string;
    fullname: string;
    avatar?: string;
    online?: boolean;
    lastSeen?: string;
  };
}

interface GroupDetails {
  id: string;
  name: string;
  avatar?: string;
  members: GroupMember[];
  admins?: string[];
  createdAt: string;
}

export function GroupSidebar({
  groupId,
  collapsed = false,
  onClose,
  isAdmin = false,
  onRemoveMember,
  onLeaveGroup,
  onGroupUpdated,
}: GroupSidebarProps) {
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Admin edit state
  const canManage = useMemo(() => {
    if (isAdmin) return true;
    if (!group || !currentUserId) return false;
    return group.members.some((m) => m.userId === currentUserId && m.isAdmin);
  }, [group, currentUserId, isAdmin]);

  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("authToken");
        const response = await fetch(`http://localhost:4000/v1/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGroup(data.group);
        }
      } catch (error) {
        console.error("Failed to fetch group details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("currentUser");
      const parsed = raw ? JSON.parse(raw) : null;
      setCurrentUserId(parsed?.id ? String(parsed.id) : null);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    if (!group) return;
    setNameDraft(group.name || "");
    setEditingName(false);
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
  }, [group]);

  const updateGroup = async (opts: { name?: string; avatarFile?: File | null }) => {
    if (!groupId) return;

    const token = sessionStorage.getItem("authToken");
    if (!token) return;

    const formData = new FormData();
    if (typeof opts.name === "string") formData.append("name", opts.name);
    if (opts.avatarFile) formData.append("avatar", opts.avatarFile);

    const response = await fetch(`http://localhost:4000/v1/groups/${groupId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to update group");
      return;
    }

    const data = await response.json();
    setGroup(data.group);
    onGroupUpdated?.(data.group);
  };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return;
    setSavingName(true);
    try {
      await updateGroup({ name: nameDraft.trim() });
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      await updateGroup({ avatarFile });
      setAvatarFile(null);
      setAvatarPreviewUrl(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!groupId || collapsed) {
    return null;
  }

  return (
    <div className="w-80 h-full border-l border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={group?.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-600 text-white">
              <Users className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-white truncate">
              {group?.name || "Group details"}
            </p>
            {group && (
              <p className="text-xs text-slate-400">
                {group.members?.length || 0} members
              </p>
            )}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-800/80"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {canManage && group && (
        <div className="px-4 py-3 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Group photo
              </p>
              <p className="text-xs text-slate-500 truncate">Update the group avatar for the chat header</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-slate-200 border-slate-700 hover:bg-slate-800/50 hover:text-white"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveAvatar}
                disabled={!avatarFile || uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading..." : "Update"}
              </Button>
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setAvatarFile(file);
              if (file) setAvatarPreviewUrl(URL.createObjectURL(file));
              else setAvatarPreviewUrl(null);
            }}
          />

          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={avatarPreviewUrl || group.avatar || "/placeholder.svg"} alt="Group avatar" />
              <AvatarFallback className="bg-blue-600 text-white">
                <Users className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            {avatarFile && (
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{avatarFile.name}</p>
                <p className="text-xs text-slate-400">Preview ready</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Group name</p>
              {!editingName ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60"
                  onClick={() => setEditingName(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveName}
                  disabled={savingName || !nameDraft.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingName ? "Saving..." : "Save"}
                </Button>
              )}
            </div>

            {editingName ? (
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            ) : (
              <p className="text-sm text-white truncate">{group.name}</p>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Loading group...
        </div>
      ) : !group ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No group selected
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Members
                </h3>
                <div className="space-y-2">
                  {group.members.map((member) => {
                    const isOwner = group.admins?.includes(member.user.id);
                    return (
                      <div
                        key={member.user.id}
                        className="flex items-center justify-between p-2 rounded-md bg-slate-800/60"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user.avatar} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {member.user.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm text-white truncate">
                              {member.user.fullname || member.user.username}
                            </p>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-slate-400 truncate">
                                @{member.user.username}
                              </p>
                              {isOwner && (
                                <span className="flex items-center gap-1 text-[0.65rem] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                                  <Crown className="h-3 w-3" />
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isAdmin &&
                          onRemoveMember &&
                          !isOwner && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-red-500/60 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              onClick={() => onRemoveMember(member.user.id)}
                            >
                              Remove
                            </Button>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>

          {onLeaveGroup && (
            <div className="p-4 border-t border-slate-800">
              <Button
                variant="outline"
                className="w-full border-red-500/60 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={onLeaveGroup}
              >
                Leave group
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}