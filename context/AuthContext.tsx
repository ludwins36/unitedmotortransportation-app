import { registerUnauthenticatedCallback } from "@/services/apiClient";
import { useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

interface AuthContextType {
  userToken: string | null;
  userData: any | null;
  isLoading: boolean;
  signIn: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (user: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userData: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateUserData: async () => {},
});

const saveStorageItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

// Función auxiliar para obtener datos
const getStorageItem = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

// Función auxiliar para borrar datos
const deleteStorageItem = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // Cargar sesión al iniciar la app
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await getStorageItem("userToken");
        const storedUser = await getStorageItem("userData");

        if (storedToken && storedUser) {
          setUserToken(storedToken);
          setUserData(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Error restaurando sesión:", e);
        // Si hay error (token corrupto, etc), limpiamos
        await signOut();
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Manejar redirecciones (Protección de rutas)
  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inChat = segments[0] === "chat";
    const inVehicle = segments[0] === "vehicle";

    if (userToken) {
      // Si el usuario está logueado, permitir (tabs), chat o detalle de vehículo
      const isAllowedArea = inTabsGroup || inChat || inVehicle;

      if (!isAllowedArea) {
        router.replace("/(tabs)/home");
      }
    } else {
      // Usuario NO logueado
      // Si intenta acceder a cualquier ruta que no sea la raíz (login), redirigir a raíz
      // Validamos que sea una ruta protegida (tabs o chat o cualquier otra subruta)
      const isProtectedArea = inTabsGroup || inChat || segments.length > 0;

      if (isProtectedArea) {
        router.replace("/");
      }
    }
  }, [userToken, segments, isLoading]);

  const signIn = async (token: string, user: any) => {
    try {
      await saveStorageItem("userToken", token);
      await saveStorageItem("userData", JSON.stringify(user));
      setUserToken(token);
      setUserData(user);
    } catch (e) {
      console.error("Error guardando sesión:", e);
      throw e;
    }
  };

  const signOut = async () => {
    try {
      // 1. Limpiamos el estado local primero para disparar el useEffect de redirección
      setUserToken(null);
      setUserData(null);

      // 2. Limpiamos el almacenamiento de forma asíncrona
      await deleteStorageItem("userToken");
      await deleteStorageItem("userData");
    } catch (e) {
      console.error("Error cerrando sesión:", e);
    }
  };

  const updateUserData = async (newData: any) => {
    try {
      const updated = { ...userData, ...newData };
      await saveStorageItem("userData", JSON.stringify(updated));
      setUserData(updated);
    } catch (e) {
      console.error("Error actualizando datos de usuario:", e);
    }
  };

  // Registrar callback en apiClient una vez
  useEffect(() => {
    registerUnauthenticatedCallback(signOut);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userData,
        isLoading,
        signIn,
        signOut,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
