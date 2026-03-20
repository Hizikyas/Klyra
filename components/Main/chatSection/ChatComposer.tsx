"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  isGroup: boolean;
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  replyingTo: any | null;
  editingMessage: any | null;
  onCancelReplyOrEdit: () => void;

  selectedFile: File | null;
  onSelectedFileChange: (file: File | null) => void;

  getFileIcon: (mediaType?: string) => ReactNode;
}

export function ChatComposer({
  isGroup,
  message,
  onMessageChange,
  onSendMessage,
  replyingTo,
  editingMessage,
  onCancelReplyOrEdit,
  selectedFile,
  onSelectedFileChange,
  getFileIcon,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const placeholder = isGroup ? "Message to group..." : "Type a message...";

  const accept = "image/*,application/pdf,.doc,.docx,.xls,.xlsx";

  const fileSizeMb = useMemo(() => {
    if (!selectedFile) return null;
    return (selectedFile.size / 1024 / 1024).toFixed(2);
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) {
      setImagePreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    setImagePreviewUrl(null);
  }, [selectedFile]);

  return (
    <div className="p-3 md:p-4 border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm sticky bottom-0 z-10">
      {(replyingTo || editingMessage) && (
        <div className="mb-2 p-2 bg-slate-700/30 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-purple-400">{replyingTo ? "Replying to" : "Editing"}:</p>
            <p className="text-xs text-slate-300 truncate max-w-xs">
              {replyingTo?.content || editingMessage?.content || "Message"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancelReplyOrEdit}>
            ✕
          </Button>
        </div>
      )}

      {selectedFile && (
        <div className="mb-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={imagePreviewUrl || ""}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                  {getFileIcon(selectedFile.type || "")}
                </div>
              )}
              <div>
                <p className="text-sm text-white font-medium truncate">{selectedFile.name}</p>
                {fileSizeMb && <p className="text-xs text-slate-400">{fileSizeMb} MB</p>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSelectedFileChange(null)}
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
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onSelectedFileChange(file);
          }}
          className="hidden"
          accept={accept}
        />

        <div className="flex-1 relative min-w-0">
          <Input
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={placeholder}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 pr-10 md:pr-12 text-sm md:text-base"
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white hidden sm:flex"
          >
            <Smile className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>

        <Button
          onClick={onSendMessage}
          className={cn(
            "text-white flex-shrink-0",
            isGroup ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"
          )}
        >
          <Send className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </div>
  );
}

