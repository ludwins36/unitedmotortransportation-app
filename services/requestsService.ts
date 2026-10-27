import { ENDPOINTS } from "@/constants/config";
import { appendImageToFormData } from "@/utils/formData";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { apiFetch } from "./apiClient";

// Helper para obtener el token almacenado
const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("userToken");
  }
  return await SecureStore.getItemAsync("userToken");
};

export const requestsService = {
  // Obtener todas las solicitudes
  getAll: async () => {
    const token = await getToken();
    return apiFetch(ENDPOINTS.REQUESTS, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Crear una nueva solicitud
  create: async (data: any) => {
    const token = await getToken();
    return apiFetch(ENDPOINTS.REQUESTS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        // Adaptamos los datos para WP (title, content, acf fields, etc.)
        // Esto depende de tu estructura en el backend.
        // Ejemplo genérico para CPT:
        title: data.title || "Nueva Solicitud",
        status: "publish", // O 'pending'
        ...data, // Otros campos (ej: fields: { ... } para ACF)
      }),
    });
  },

  updateStatus: async (
    id: string | number,
    status: string,
    imageUri?: string,
  ) => {
    const token = await getToken();

    if (imageUri) {
      const formData = new FormData();
      formData.append("status", status);
      await appendImageToFormData(formData, "foto", imageUri);

      return apiFetch(`${ENDPOINTS.REQUESTS}/${id}/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }

    return apiFetch(`${ENDPOINTS.REQUESTS}/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  },

  getStatusProofs: async (id: string | number) => {
    const token = await getToken();
    return apiFetch(`${ENDPOINTS.REQUESTS}/${id}/status-history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Borrar una solicitud
  delete: async (id: string | number) => {
    const token = await getToken();
    return apiFetch(`${ENDPOINTS.REQUESTS}/${id}`, {
      method: "DELETE", // WP suele requerir ?force=true para saltar la papelera
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
