import { API_URL } from "@/constants/config";

// --- Callback para manejar cierre de sesión automático ---
let onUnauthenticatedCallback: (() => void) | null = null;

export const registerUnauthenticatedCallback = (callback: () => void) => {
  onUnauthenticatedCallback = callback;
};
// --------------------------------------------------------

// Función genérica para manejar peticiones y errores
export async function apiFetch<T = Record<string, unknown>>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  // const defaultHeaders = {
  //   'Content-Type': 'application/json',
  //   'Accept': 'application/json',
  // };
  const headers = new Headers(options.headers);

  // Verificación robusta de FormData
  const isFormData =
    options.body instanceof FormData ||
    (options.body &&
      typeof options.body === "object" &&
      (options.body as any).constructor &&
      (options.body as any).constructor.name === "FormData");

  if (!isFormData) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else {
    // IMPORTANTE: Si es FormData, nos aseguramos de que NO haya Content-Type
    // para que Fetch genere el boundary correcto automáticamente
    headers.delete("Content-Type");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    if (text) {
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        data = { message: text };
      }
    }

    console.log("🚀 ~ apiFetch ~ response:", response);
    if (!response.ok) {
      const code =
        typeof data.code === "string" ? data.code : "API_ERROR";
      const message =
        typeof data.message === "string"
          ? data.message
          : "Error desconocido en la petición";
      const errorData = {
        code,
        message,
        status: response.status,
      };

      // Si el token es inválido, ejecutamos el callback de cierre de sesión
      if (
        data.code === "jwt_auth_invalid_token" ||
        data.code === "jwt_auth_expired" ||
        data.code === "[jwt_auth] invalid_token" || // Algunos plugins usan este formato
        response.status === 401 ||
        response.status === 403
      ) {
        if (onUnauthenticatedCallback) {
          onUnauthenticatedCallback();
        }
      }

      throw errorData;
    }

    return data as T;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}
