"use client";

import React from "react";
import { MessageSquare, X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  isOnline?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  isOnline = true,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[#2D5A27] text-white rounded-t-2xl shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-white/20 p-2 rounded-full">
            <MessageSquare size={20} className="text-white" />
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#2D5A27] rounded-full shadow-sm" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-sm">Asistente AmaTuris</h3>
          <p className="text-[10px] text-emerald-100 flex items-center gap-1">
            {isOnline ? "En línea" : "Desconectado"}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
      >
        <X size={20} />
      </button>
    </div>
  );
};
