 "use client";

import { useEffect, useState } from "react";
import { X, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupSidebarProps {
  groupId: string | null;
  collapsed?: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onRemoveMember?: (userId: string) => void;
  onLeaveGroup?: () => void;
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
  admins: string[];
  createdAt: string;
}

export function GroupSidebar({
  groupId,
  collapsed = false,
  onClose,
  isAdmin = false,
  onRemoveMember,
  onLeaveGroup,
}: GroupSidebarProps) {
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(false);

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
                              size="xs"
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