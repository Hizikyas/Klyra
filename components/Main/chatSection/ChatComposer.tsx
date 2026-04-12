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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const emojiContainerRef = useRef<HTMLDivElement | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = [
    "😀", "😂", "😊", "😍", "🥳", "😎", "🤔", "😢", "😭", "😡",
    "👍", "👎", "🙏", "👏", "💯", "🔥", "❤️", "💙", "🎉", "✨",
  ];

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

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!emojiContainerRef.current) return;
      if (!emojiContainerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji: string) => {
    onMessageChange(`${message}${emoji}`);
    inputRef.current?.focus();
  };

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
            ref={inputRef}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={placeholder}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 pr-10 md:pr-12 text-sm md:text-base"
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          />
          <div ref={emojiContainerRef} className="absolute right-1 top-1/2 -translate-y-1/2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white flex"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              type="button"
            >
              <Smile className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            {showEmojiPicker && (
              <div className="absolute bottom-11 right-0 w-60 rounded-lg border border-slate-600 bg-slate-800/95 p-3 shadow-xl backdrop-blur">
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="rounded-md p-1.5 text-lg transition-colors hover:bg-slate-700/70"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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

