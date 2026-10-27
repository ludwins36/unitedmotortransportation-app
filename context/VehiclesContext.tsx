import { ENDPOINTS } from "@/constants/config";
import { apiFetch } from "@/services/apiClient";
import { Vehicle } from "@/types/vehicle";
import { mapApiStatusToApp } from "@/utils/orderStatus";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAuth } from "./AuthContext";

interface VehiclesContextType {
  vehicles: Vehicle[];
  isLoading: boolean;
  refreshVehicles: () => Promise<void>;
  getVehicleById: (id: string) => Vehicle | undefined;
  updateVehicleStatus: (id: string, status: Vehicle["status"]) => void;
}

const VehiclesContext = createContext<VehiclesContextType | undefined>(
  undefined,
);

export function VehiclesProvider({ children }: { children: React.ReactNode }) {
  const { userToken } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem("vehicles_cache");
      if (cached) {
        setVehicles(JSON.parse(cached));
      }
    } catch (e) {
      console.error("Error loading vehicles from cache", e);
    }
  };

  const saveToCache = async (data: Vehicle[]) => {
    try {
      await AsyncStorage.setItem("vehicles_cache", JSON.stringify(data));
    } catch (e) {
      console.error("Error saving vehicles to cache", e);
    }
  };

  const refreshVehicles = useCallback(async () => {
    if (!userToken) return;

    try {
      // setIsLoading(true); // Opcional: si queremos mostrar spinner cada vez
      const data = await apiFetch(ENDPOINTS.REQUESTS, {
        method: "GET",
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const mapped: Vehicle[] = Array.isArray(data)
        ? data.map((item: any) => ({
            id: String(item.id || item.ID),
            vin: item.vin || "",
            subasta: item.subasta || "",
            estadoSubasta: item.estadoSubasta || "",
            comprador: item.comprador || "",
            pais: item.pais || "",
            date: item.date || "",
            status: mapApiStatusToApp(item.status || item.post_status),
            price:
              typeof item.price === "number"
                ? item.price
                : typeof item.price === "string"
                  ? parseFloat(item.price) || undefined
                  : undefined,
            foto_url: item.foto_url,
            factura_url: item.factura_url,
            title: item.title,
          }))
        : [];

      setVehicles(mapped);
      saveToCache(mapped);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  // Carga inicial: Cache -> API
  useEffect(() => {
    if (userToken) {
      // Cargar caché primero para mostrar algo rápido
      loadFromCache().then(() => {
        // Luego actualizar desde la API en background
        refreshVehicles();
      });
    } else {
      setVehicles([]);
      setIsLoading(false);
    }
  }, [userToken, refreshVehicles]);

  const getVehicleById = useCallback(
    (id: string) => {
      // Busca por ID exacto, asegurando tipos string
      return vehicles.find((v) => String(v.id) === String(id));
    },
    [vehicles],
  );

  const updateVehicleStatus = useCallback(
    (id: string, status: Vehicle["status"]) => {
      setVehicles((prev) => {
        const updated = prev.map((v) =>
          String(v.id) === String(id) ? { ...v, status } : v,
        );
        saveToCache(updated);
        return updated;
      });
    },
    [],
  );

  return (
    <VehiclesContext.Provider
      value={{
        vehicles,
        isLoading,
        refreshVehicles,
        getVehicleById,
        updateVehicleStatus,
      }}
    >
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehiclesContext() {
  const context = useContext(VehiclesContext);
  if (context === undefined) {
    throw new Error(
      "useVehiclesContext must be used within a VehiclesProvider",
    );
  }
  return context;
}
