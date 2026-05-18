"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatHeader } from "../molecules/ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "../molecules/ChatInput";
import { ChatMessage } from "@/types/chat";
import { sendChatMessage } from "@/services/chat";
import { MessageCircle } from "lucide-react";

type FloatingPosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

const BUBBLE_SIZE = 56;
const EDGE_GAP = 20;
const DEFAULT_GAP = 24;
const PANEL_GAP = 14;
const DRAG_THRESHOLD = 4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const getDefaultPosition = (): FloatingPosition => ({
  x: window.innerWidth - BUBBLE_SIZE - DEFAULT_GAP,
  y: window.innerHeight - BUBBLE_SIZE - DEFAULT_GAP,
});

const clampBubblePosition = (position: FloatingPosition): FloatingPosition => ({
  x: clamp(position.x, EDGE_GAP, window.innerWidth - BUBBLE_SIZE - EDGE_GAP),
  y: clamp(position.y, EDGE_GAP, window.innerHeight - BUBBLE_SIZE - EDGE_GAP),
});

export const ChatShell: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [externalDraft, setExternalDraft] = useState<string>("");
  const [externalDraftKey, setExternalDraftKey] = useState(0);
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const [panelPosition, setPanelPosition] = useState<FloatingPosition | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bubbleButtonRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const didDragRef = useRef(false);

  useEffect(() => {
    // Persistir user_id en localStorage
    let storedId = localStorage.getItem("amaturis_user_id");
    if (!storedId) {
      storedId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("amaturis_user_id", storedId);
    }
    setUserId(storedId);

    // Cargar historial si existiera (opcional, por ahora solo recuperamos el ID)
  }, []);

  useEffect(() => {
    setPosition(clampBubblePosition(getDefaultPosition()));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setPosition((currentPosition) => {
        if (!currentPosition) return currentPosition;

        return clampBubblePosition(currentPosition);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updatePanelPosition = useCallback(() => {
    if (!isOpen || !position) {
      setPanelPosition(null);
      return;
    }

    const panel = panelRef.current;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const fallbackPanelWidth = Math.min(
      viewportWidth - EDGE_GAP * 2,
      viewportWidth >= 640 ? 384 : 320,
    );
    const panelWidth = panel?.offsetWidth ?? fallbackPanelWidth;
    const panelHeight = panel?.offsetHeight ?? 560;
    const opensToRight = position.x + BUBBLE_SIZE / 2 < viewportWidth / 2;
    const preferredLeft = opensToRight
      ? position.x
      : position.x + BUBBLE_SIZE - panelWidth;
    const left = clamp(
      preferredLeft,
      EDGE_GAP,
      viewportWidth - panelWidth - EDGE_GAP,
    );
    const topAbove = position.y - PANEL_GAP - panelHeight;
    const topBelow = position.y + BUBBLE_SIZE + PANEL_GAP;
    const preferredTop = topAbove >= EDGE_GAP ? topAbove : topBelow;
    const top = clamp(
      preferredTop,
      EDGE_GAP,
      viewportHeight - panelHeight - EDGE_GAP,
    );

    setPanelPosition({ x: left, y: top });
  }, [isOpen, position]);

  useEffect(() => {
    updatePanelPosition();
  }, [
    externalDraftKey,
    isLoading,
    messages.length,
    updatePanelPosition,
  ]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!isOpen || !panel) return;

    const observer = new ResizeObserver(() => updatePanelPosition());
    observer.observe(panel);

    return () => observer.disconnect();
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;

      if (!dragState.moved) {
        dragState.moved = Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD;
      }

      if (!dragState.moved) return;

      didDragRef.current = true;
      event.preventDefault();
      setPosition(
        clampBubblePosition({
          x: dragState.originX + deltaX,
          y: dragState.originY + deltaY,
        }),
      );
    };

    const handleWindowPointerUp = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      const finalPosition = clampBubblePosition({
        x: dragState.originX + deltaX,
        y: dragState.originY + deltaY,
      });

      if (dragState.moved) {
        setPosition(finalPosition);
      }

      const bubbleButton = bubbleButtonRef.current;
      if (bubbleButton?.hasPointerCapture(event.pointerId)) {
        bubbleButton.releasePointerCapture(event.pointerId);
      }

      dragStateRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, []);

  useEffect(() => {
    const handlePrefillRequest = (event: Event) => {
      const customEvent = event as CustomEvent<{ draft?: string }>;
      const draft = customEvent.detail?.draft?.trim();
      if (!draft) return;

      setIsOpen(true);
      setExternalDraft(draft);
      setExternalDraftKey((prev) => prev + 1);
    };

    window.addEventListener("amaturis:chat-prefill", handlePrefillRequest);
    return () => {
      window.removeEventListener("amaturis:chat-prefill", handlePrefillRequest);
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!position || event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
    didDragRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleToggleChat = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    setIsOpen((currentIsOpen) => !currentIsOpen);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: text,
        user_id: userId,
      });

      const data = Array.isArray(response) ? response[0] : response;

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        text: data.output || "No pude obtener una respuesta clara.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error en AmaTuris:", error);
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        text: "Lo siento, tuve un problema al procesar tu solicitud. Por favor intenta de nuevo.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const hiddenRoutes = new Set([
    "/login",
    "/registro",
    "/olvide-contrasena",
  ]);

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed z-50 flex max-h-[calc(100vh-40px)] w-[min(calc(100vw-40px),20rem)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:w-96"
          style={{
            left: `${panelPosition?.x ?? EDGE_GAP}px`,
            top: `${panelPosition?.y ?? EDGE_GAP}px`,
            visibility: panelPosition ? "visible" : "hidden",
          }}
        >
          <ChatHeader onClose={() => setIsOpen(false)} />
          <MessageList messages={messages} isLoading={isLoading} />
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            externalDraft={externalDraft}
            externalDraftKey={externalDraftKey}
          />
        </div>
      )}

      {position && (
        <div
          className="fixed left-0 top-0 z-50"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        >
          <button
            ref={bubbleButtonRef}
            type="button"
            aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
            onClick={handleToggleChat}
            onPointerDown={handlePointerDown}
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#2D5A27] text-white shadow-lg transition-[box-shadow,transform] active:scale-95 ${
              isDragging
                ? "cursor-grabbing shadow-2xl"
                : "cursor-grab hover:scale-110"
            } touch-none select-none`}
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}
    </>
  );
};
