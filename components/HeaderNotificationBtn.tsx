import { useVehiclesContext } from "@/context/VehiclesContext";
import {
    Notification,
    notificationsService,
} from "@/services/notificationsService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NotificationsModal } from "./ui/NotificationsModal";
interface HeaderNotificationBtnProps {
  color?: string;
  style?: any;
}

export function HeaderNotificationBtn({
  color = "#fff",
  style,
}: HeaderNotificationBtnProps) {
  const router = useRouter();
  const { getVehicleById } = useVehiclesContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await notificationsService.getAll();
      console.log("🚀 ~ fetchNotifications ~ data:", data);
      setNotifications(data);
      // Calcular no leídas (asumiendo que la API devuelve un campo 'read' o similar)
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true); // Carga inicial con loader

    const intervalId = setInterval(() => {
      fetchNotifications(false); // Polling silencioso
    }, 20000); // 20 segundos

    return () => clearInterval(intervalId); // Limpiar intervalo al desmontar
  }, []);

  const handleOpenItems = () => {
    setModalVisible(true);
    fetchNotifications(true); // Refrescar al abrir
  };

  const handleCloseModal = async () => {
    setModalVisible(false);

    // Filtrar las no leídas actualmente
    const unread = notifications.filter((n) => !n.read);

    if (unread.length > 0) {
      // 1. Actualizar UI localmente (optimistic update)
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);

      // 2. Enviar peticiones al backend en segundo plano
      try {
        await Promise.all(
          unread.map((n) => notificationsService.markAsRead(n.id)),
        );
      } catch (error) {
        console.error("Error marcando notificaciones como leídas:", error);
        // Si falla, en el próximo polling se corregirá el estado real
      }
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // 1. Marcar como leída si no lo está (optimistic update)
    if (!notification.read) {
      // Actualizar estado local
      const updated = notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n,
      );
      setNotifications(updated);
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // En segundo plano
      try {
        await notificationsService.markAsRead(notification.id);
      } catch (error) {
        console.error("Error marcando notificación:", error);
      }
    }

    // 2. Cerrar modal
    setModalVisible(false);

    // 3. Navegar si es tipo link
    console.log("🚀 ~ handleNotificationPress ~ notification:", notification);
    if (notification.type === "link" && notification.href) {
      const vehicle = getVehicleById(notification.href);
      console.log("🚀 ~ handleNotificationPress ~ vehicle:", vehicle);
      if (vehicle) {
        router.push({
          pathname: "/chat/[id]",
          params: {
            id: notification.href,
            vehicleData: JSON.stringify(vehicle),
          },
        } as any);
      } else {
        console.warn("Vehicle not found in cache, navigating without data");
        router.push({
          pathname: "/chat/[id]",
          params: {
            id: notification.href,
            vehicleData: null,
          },
        } as any);
      }
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={handleOpenItems}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications" size={24} color="#FBB000" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <NotificationsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        notifications={notifications}
        isLoading={isLoading}
        onRefresh={() => fetchNotifications(true)}
        onNotificationPress={handleNotificationPress}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 2,
  },
});
