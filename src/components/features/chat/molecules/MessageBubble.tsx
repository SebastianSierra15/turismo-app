"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/types/chat";
import { twMerge } from "tailwind-merge";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === "bot";

  return (
    <div
      className={twMerge(
        "flex w-full mb-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={twMerge(
          "max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm",
          isBot
            ? "bg-emerald-50 text-slate-800 rounded-tl-none border border-emerald-100"
            : "bg-[#2D5A27] text-white rounded-tr-none"
        )}
      >
        {isBot ? (
          <div
            className={twMerge(
              "leading-relaxed",
              "[&>p]:mb-2 [&>p:last-child]:mb-0",
              "[&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5",
              "[&>ol]:my-2 [&>ol]:list-decimal [&>ol]:pl-5",
              "[&_strong]:font-bold [&_em]:italic",
              "[&_a]:font-medium [&_a]:underline",
            )}
          >
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        ) : (
          <p className="leading-relaxed">{message.text}</p>
        )}
        <span
          className={twMerge(
            "text-[10px] mt-1 block opacity-70 text-right",
            isBot ? "text-slate-500" : "text-emerald-100"
          )}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
