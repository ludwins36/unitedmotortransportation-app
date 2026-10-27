import { ENDPOINTS } from "@/constants/config";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { useCallback, useState } from "react";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "admin";
  timestamp: string;
}

export function useChat(requestId: string) {
  const { userToken, userData } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!requestId || !userToken) return;

    try {
      //   setIsLoading(true);
      setError(null);
      // Construct URL: /united-motor/v1/solicitudes/{id}/chat
      const endpoint = `${ENDPOINTS.REQUESTS}/${requestId}/chat`;

      console.log("[CHAT] Fetching messages from:", endpoint);

      const response = await apiFetch(endpoint, {
        method: "GET",
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log("[CHAT] Raw API response:", response);

      // Assuming response is an array of messages or { data: [...] }
      const rawMessages = Array.isArray(response)
        ? response
        : response.data || [];

      console.log("[CHAT] Parsed raw messages:", rawMessages);

      const currentUserId = userData?.id || userData?.ID || userData?.user_id;
      console.log("🚀 ~ useChat ~ userData:", userData);
      console.log("🚀 ~ useChat ~ currentUserId:", currentUserId);

      // Map to frontend structure
      const mappedMessages: ChatMessage[] = rawMessages.map((msg: any) => {
        const msgAuthorId = msg.author_id;
        const isMe = String(msgAuthorId) === String(currentUserId);

        return {
          id: msg.id ? String(msg.id) : Math.random().toString(),
          text: msg.content || msg.message || "",
          sender: isMe ? "user" : "admin",
          timestamp: msg.date || msg.timestamp || new Date().toISOString(),
        };
      });

      // Sort by timestamp if needed (oldest first usually)
      mappedMessages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      setMessages(mappedMessages);
    } catch (e: any) {
      console.error("[CHAT] Error fetching chat:", e);
      setError(e.message || "Error al cargar los mensajes");
    } finally {
      //   setIsLoading(false);
    }
  }, [requestId, userToken]);

  const sendMessage = async (text: string) => {
    if (!requestId || !userToken || !text.trim()) return;

    // Optimistic update
    const tempListId = Date.now().toString();
    const newMessage: ChatMessage = {
      id: tempListId,
      text: text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    console.log("[CHAT] Sending message:", newMessage);
    setMessages((prev) => [...prev, newMessage]);

    try {
      const endpoint = `${ENDPOINTS.REQUESTS}/${requestId}/chat`;

      console.log("[CHAT] POST to:", endpoint, "with body:", {
        message: text,
      });

      await apiFetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ message: text }),
      });

      // Success
    } catch (e: any) {
      // Rollback optimistic update on error
      console.error("[CHAT] Error sending message:", e);
      setError(e.message || "Error al enviar el mensaje");

      setMessages((prev) => prev.filter((m) => m.id !== tempListId));
      throw e;
    }
  };

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
  };
}
