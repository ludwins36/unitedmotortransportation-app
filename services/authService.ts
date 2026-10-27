import { ENDPOINTS, WC_CONFIG } from "@/constants/config";
import { AuthResponse } from "@/types/auth"; // Usaremos esto más adelante
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { apiFetch } from "./apiClient";

export const getToken = async () => {
  if (Platform.OS === "web") {
    // En web, localStorage es síncrono.
    return localStorage.getItem("userToken");
  }
  // En nativo, SecureStore es asíncrono.
  return await SecureStore.getItemAsync("userToken");
};

export const authService = {
  // Login contra WordPress/JWT
  login: async (username: string, password: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>(ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });
  },

  requestPasswordReset: async (email: string) => {
    return apiFetch(ENDPOINTS.PASSWORD_RESET, {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });
  },

  getCurrentUser: async (token: string) => {
    return apiFetch("/wp/v2/users/me?context=edit", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Registro (dependerá de cómo tengas configurado WooCommerce/WP)
  register: async (userData: any) => {
    // Nota: Para registrar usuarios en WP via API, necesitarás permisos de admin o un endpoint público personalizado
    // O usar el endpoint de clientes de WooCommerce: /wc/v3/customers
    const auth = btoa(`${WC_CONFIG.CONSUMER_KEY}:${WC_CONFIG.CONSUMER_SECRET}`);
    return apiFetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        email: userData.email,
        first_name: userData.fullName.split(" ")[0] || "",
        last_name: userData.fullName.split(" ").slice(1).join(" ") || "",
        // username: userData.email.split("@")[0], // Generar un username basado en email
        username: userData.email, // Generar un username basado en email
        password: userData.password,
        billing: {
          phone: userData.phone,
          company: userData.companyName ?? userData.company,
        },
      }),
    });
  },

  /** Elimina la cuenta del usuario actual (requiere endpoint DELETE en el servidor). */
  deleteAccount: async () => {
    const token = await getToken();
    if (!token) {
      throw { code: "no_token", message: "No hay sesión activa." };
    }
    return apiFetch(ENDPOINTS.DELETE_ACCOUNT, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  uploadAvatar: async (uri: string) => {
    const token = await getToken();
    const formData = new FormData();
    const filename = uri.split("/").pop() || "profile.jpg";

    // Inferir tipo de archivo
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    if (Platform.OS === "web") {
      // En web, necesitamos convertir la URI a Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append("file", blob, filename);
    } else {
      // En nativo, pasamos el objeto con uri, name y type
      formData.append("file", {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: filename,
        type,
      } as any);
    }

    return apiFetch(ENDPOINTS.AVATAR, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },
};
