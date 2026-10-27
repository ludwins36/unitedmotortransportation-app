import { useVehiclesContext } from "@/context/VehiclesContext";
import { VehicleStatus } from "@/types/vehicle";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

export function useVehicles() {
  const { vehicles, isLoading, refreshVehicles } = useVehiclesContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | VehicleStatus>("all");

  // Al enfocar la pantalla ("mis vehiculos"), refrescar datos (background refresh)
  useFocusEffect(
    useCallback(() => {
      refreshVehicles();
    }, [refreshVehicles]),
  );

  // Función para Pull-to-Refresh
  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    await refreshVehicles();
    setIsRefreshing(false);
  }, [refreshVehicles]);

  // Lógica de Filtrado (Memorizada para rendimiento)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // 1. Filtro por Texto (Buscador)
      const matchesSearch =
        (vehicle.vin &&
          vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (vehicle.subasta &&
          vehicle.subasta.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (vehicle.comprador &&
          vehicle.comprador
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (vehicle.title &&
          vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Filtro por Estado (Tabs/Botones)
      const matchesStatus =
        filterStatus === "all" || vehicle.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, filterStatus]);

  return {
    vehicles: filteredVehicles,
    isLoading,
    isRefreshing,
    refetch,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
  };
}
