"use client";

import { useRef } from "react";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { IoCheckmarkDone } from "react-icons/io5";
import type { ReactNode } from "react";

// This component is intentionally typed loosely: it receives the same message/group objects
// already produced by `ChatSection` and just renders them.
interface Message {
  id: string;
  isOwn: boolean;
  senderId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  timestamp: string;
  status?: "sending" | "sent" | "read";
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: any;
  isRead?: boolean;
}

interface GroupInfoLike {
  members: Array<{
    user: {
      id: string;
      username?: string;
      fullname?: string;
      avatar?: string;
    };
  }>;
}

interface GroupedMessages {
  date: string;
  messages: Message[];
}

interface ChatMessageListProps {
  groupedMessages: GroupedMessages[];
  selectedChatObj: any;
  groupInfo: GroupInfoLike | null;
  getFileIcon: (mediaType?: string) => ReactNode;
  onImageClick: (imageUrl: string) => void;
  onOpenContextMenu: (msg: any, e: ReactMouseEvent | ReactTouchEvent) => void;
}

export function ChatMessageList({
  groupedMessages,
  selectedChatObj,
  groupInfo,
  getFileIcon,
  onImageClick,
  onOpenContextMenu,
}: ChatMessageListProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const renderAvatarForMessage = (msg: Message) => {
    if (msg.isOwn) return null;

    if (selectedChatObj?.isGroup) {
      const messageSender = groupInfo?.members?.find((m) => m.user.id === msg.senderId)?.user;
      return (
        <Avatar className="h-6 w-6 mb-0">
          {messageSender?.avatar ? <AvatarImage src={messageSender.avatar} /> : null}
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {(messageSender?.username || "").charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <Avatar className="h-6 w-6 mb-0">
        <AvatarImage src={selectedChatObj?.avatar} />
        <AvatarFallback className="bg-purple-600 text-white text-xs">
          {(selectedChatObj?.name || "F").charAt(0)}
        </AvatarFallback>
      </Avatar>
    );
  };

  return (
    <div>
      {groupedMessages.map((group, index) => (
        <div key={group.date || index}>
          {group.date && (
            <div className="sticky top-0 z-10 bg-transparent text-slate-300 text-center py-2 rounded-lg mx-auto w-fit px-4 mb-4">
              <span className="text-sm font-medium">{group.date}</span>
            </div>
          )}

          {group.messages.map((msg) => {
            if (msg.isDeleted) return null;

            const messageSender = selectedChatObj?.isGroup && groupInfo
              ? groupInfo.members.find((m) => m.user.id === msg.senderId)?.user
              : null;

            return (
              <div
                key={msg.id}
                className={cn("flex items-end gap-2 my-2", msg.isOwn ? "justify-end" : "justify-start")}
                data-message-id={msg.id}
                data-is-own={msg.isOwn.toString()}
                onContextMenu={(e) => onOpenContextMenu(msg, e)}
                onTouchStart={(e) => {
                  longPressTimer.current = setTimeout(() => onOpenContextMenu(msg, e), 500);
                }}
                onTouchEnd={() => {
                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                }}
                onTouchMove={() => {
                  if (longPressTimer.current) clearTimeout(longPressTimer.current);
                }}
              >
                {!msg.isOwn && renderAvatarForMessage(msg)}

                <div
                  className={cn(
                    "max-w-[75%] sm:max-w-xs md:max-w-sm lg:max-w-md flex flex-col",
                    msg.isOwn
                      ? "bg-purple-600 text-white rounded-tl-md rounded-bl-md rounded-tr-[1rem] rounded-br-none"
                      : selectedChatObj?.isGroup
                      ? "bg-blue-700 text-white rounded-tr-md rounded-br-md rounded-tl-[1rem] rounded-bl-none"
                      : "bg-slate-700 text-white rounded-tr-md rounded-br-md rounded-tl-[1rem] rounded-bl-none",
                    msg.mediaType?.startsWith("image/")
                      ? "p-0"
                      : "px-3 py-1.5 md:px-4 md:py-2"
                  )}
                >
                  {selectedChatObj?.isGroup && !msg.isOwn && (
                    <p className="text-xs font-medium mb-1 text-blue-200">
                      {messageSender?.fullname || messageSender?.username || "Unknown"}
                    </p>
                  )}

                  {msg.replyTo && !msg.replyTo.isDeleted && (
                    <div
                      className={cn(
                        "border-l-4 pl-2 mb-2 p-2 rounded text-xs",
                        msg.isOwn
                          ? "border-purple-500 bg-purple-500/20"
                          : selectedChatObj?.isGroup
                          ? "border-blue-500 bg-blue-500/20"
                          : "border-slate-500 bg-slate-700/20"
                      )}
                    >
                      <p className="font-medium">{msg.replyTo.sender.username}</p>
                      <p className="truncate text-slate-300">
                        {msg.replyTo.content ||
                          (msg.replyTo.mediaType?.startsWith("image/") ? "Image" : "File")}
                      </p>
                    </div>
                  )}

                  {msg.mediaUrl && msg.mediaType?.startsWith("image/") ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={msg.mediaUrl}
                        alt="sent"
                        className="w-full h-64 object-cover cursor-pointer"
                        onClick={() => onImageClick(msg.mediaUrl!)}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                        <span className="text-xs text-white">{msg.timestamp}</span>
                        {msg.isOwn && (
                          <>
                            {msg.status === "read" ? (
                              <IoCheckmarkDone className="w-4 h-4 text-blue-300" />
                            ) : (
                              <Check className="w-4 h-4 text-purple-200" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.mediaUrl && (
                        <div className="mb-2">
                          <div
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-2",
                              msg.isOwn
                                ? "bg-purple-500/20 border-purple-600/50"
                                : selectedChatObj?.isGroup
                                ? "bg-blue-500/20 border-blue-600/50"
                                : "bg-slate-700/30 border-slate-600/50"
                            )}
                          >
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer"
                              onClick={() => window.open(msg.mediaUrl!, "_blank")}
                            >
                              {getFileIcon(msg.mediaType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">
                                {(() => {
                                  const name = msg.mediaUrl?.split("/").pop() || "File";
                                  try {
                                    return decodeURIComponent(name);
                                  } catch {
                                    return name;
                                  }
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
                        <span
                          className={cn(
                            "text-[0.7rem]",
                            msg.isOwn ? "text-purple-200" : selectedChatObj?.isGroup ? "text-blue-200" : "text-slate-400"
                          )}
                        >
                          {msg.timestamp}
                        </span>
                        {msg.isOwn && (
                          <>
                            {msg.status === "read" ? (
                              <IoCheckmarkDone className="w-5 h-4 text-blue-400" />
                            ) : (
                              <Check className="w-5 h-4 text-purple-200" />
                            )}
                          </>
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
      ))}
    </div>
  );
}

