"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  externalDraft?: string;
  externalDraftKey?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  externalDraft,
  externalDraftKey,
}) => {
  const [text, setText] = useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const maxLines = 3;
  const lineHeightPx = 24;
  const maxHeightPx = maxLines * lineHeightPx;

  const adjustTextareaHeight = React.useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeightPx);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeightPx ? "auto" : "hidden";
  }, [maxHeightPx]);

  React.useEffect(() => {
    if (!externalDraft) return;
    setText(externalDraft);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [externalDraft, externalDraftKey]);

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [text, externalDraftKey, adjustTextareaHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 rounded-b-2xl"
    >
      <textarea
        ref={inputRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
        placeholder="Escribe un mensaje..."
        className="flex-1 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2 text-sm leading-6 transition-all disabled:opacity-50 resize-none overflow-y-hidden"
      />
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className="bg-[#2D5A27] text-white p-2 rounded-xl hover:bg-[#23471e] transition-colors disabled:opacity-50 disabled:hover:bg-[#2D5A27] cursor-pointer"
      >
        <Send size={18} />
      </button>
    </form>
  );
};
