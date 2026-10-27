import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { useState } from "react";

/** Mensaje legible cuando el login responde OK pero sin token JWT (p. ej. cuerpo de error de WP). */
function messageWhenNoToken(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "El servidor no devolvió un token de sesión. Intenta de nuevo o contacta soporte.";
  }
  const o = payload as Record<string, unknown>;
  const raw =
    typeof o.message === "string"
      ? o.message
      : typeof o.error_description === "string"
        ? o.error_description
        : "";
  if (raw) {
    const stripped = raw.replace(/<[^>]+>/g, "").trim();
    return stripped || raw;
  }
  if (typeof o.code === "string") {
    return `No se pudo iniciar sesión (${o.code}).`;
  }
  return "El servidor no devolvió un token de sesión. Intenta de nuevo o contacta soporte.";
}

export function useAuthForm() {
  const { signIn } = useAuth(); // Usamos el contexto
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Añadimos estado de error

  // Usaremos un solo objeto para manejar el estado del formulario para mantenerlo limpio
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    phone: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    // Validaciones comunes
    if (!formData.email || !formData.email.includes("@")) {
      setError("Por favor ingresa un email válido");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    // Validaciones específicas de Registro
    if (!isLogin) {
      if (!formData.fullName.trim()) {
        setError("El nombre completo es requerido");
        return false;
      }
      if (!formData.companyName.trim()) {
        setError("El nombre de la empresa es requerido");
        return false;
      }
      if (!formData.phone.trim()) {
        setError("El teléfono es requerido");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null); // Limpiamos errores previos
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let authResponse;

      if (isLogin) {
        // Flujo normal de Login
        authResponse = await authService.login(
          formData.email,
          formData.password,
        );
      } else {
        // Flujo de Registro
        // 1. Crear usuario
        await authService.register(formData);

        // 2. Login automático inmediato para obtener el token
        authResponse = await authService.login(
          formData.email,
          formData.password,
        );
      }

      // 3. Validamos que tengamos un token
      if (authResponse?.token) {
        let userProfile: any = { ...authResponse };

        // Si la respuesta del login no tiene ID, intentamos obtener el perfil completo
        if (!userProfile.id && !userProfile.user_id) {
          try {
            const me = await authService.getCurrentUser(authResponse.token);
            if (me) {
              userProfile = { ...userProfile, ...me };
            }
          } catch (e) {
            console.error("Error fetching user profile:", e);
          }
        }

        // Nombre para mostrar en la bienvenida (registro: fullName, login: API)
        const userName =
          formData.fullName ||
          authResponse.user_display_name ||
          userProfile.name ||
          userProfile.display_name ||
          "";

        // Construir objeto de usuario final, asegurando que tengamos el ID y el nombre
        const userToSave = {
          ...userProfile,
          email: authResponse.user_email || userProfile.email || formData.email,
          display_name: userName || authResponse.user_display_name || userProfile.name || formData.fullName,
          name: userName,
          nicename: authResponse.user_nicename || userProfile.slug || "",
        };

        // Guardamos sesión y redirigimos
        await signIn(authResponse.token, userToSave);
      } else {
        setError(messageWhenNoToken(authResponse));
      }
    } catch (error: any) {
      // Si el error viene de WP suele traer mensaje HTML o códigos raros, intentamos limpiar
      const rawMsg = error.message || "Error inesperado";
      // Check simple para ver si es credenciales invalidas
      const friendlyMsg = rawMsg.includes("incorrect_password")
        ? "Contraseña incorrecta"
        : rawMsg.includes("user_exists")
          ? "Ya existe una cuenta con este email"
          : rawMsg;

      setError(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLogin,
    setIsLogin,
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
    setError,
  };
}
