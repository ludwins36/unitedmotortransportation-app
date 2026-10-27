import { ENDPOINTS } from "@/constants/config";
import { apiFetch } from "./apiClient";
import { getToken } from "./authService";

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type?: "info" | "warning" | "error" | "success" | "link";
  href?: string;
}

export const notificationsService = {
  getAll: async (): Promise<Notification[]> => {
    const token = await getToken();
    const data = await apiFetch(ENDPOINTS.NOTIFICATIONS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Mapear respuesta del servidor al formato interno si es necesario
    return data.map((item: any) => ({
      id: parseInt(item.id),
      message: item.message,
      title: item.title || "Notificación", // Título por defecto ya que no viene en JSON
      date: item.created_at,
      read: item.is_read === "1",
      type: item.type || "info", // Usar el tipo que viene del backend o default
      href: item.href, // Mapear href si viene
    }));
  },

  markAsRead: async (id: number) => {
    const token = await getToken();
    return apiFetch(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`, {
      method: "POST", // o PUT, según la API
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
