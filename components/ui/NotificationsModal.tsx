import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from "react-native";
import RenderHtml from "react-native-render-html";


export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type?: "info" | "warning" | "error" | "success" | "link";
  href?: string;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onNotificationPress: (item: NotificationItem) => void;
}

export function NotificationsModal({
  visible,
  onClose,
  notifications,
  isLoading,
  onRefresh,
  onNotificationPress,
}: NotificationsModalProps) {
  const { width } = useWindowDimensions();

  const getIconName = (type?: string) => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "error":
        return "alert-circle";
      case "link":
        return "chatbubbles"; // Icono para chat
      default:
        return "notifications-circle";
    }
  };

  const getIconColor = (type?: string) => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "warning":
        return "#FFC107";
      case "error":
        return "#FF3B30";
      case "link":
        return "#2196F3"; // Azul para enlace
      default:
        return "#2196F3";
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => onNotificationPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={getIconName(item.type)}
        size={24}
        color={getIconColor(item.type)}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <RenderHtml
          contentWidth={width - 100}
          source={{ html: item.message }}
          baseStyle={{ fontSize: 14, color: "#666" }}
        />
        {item.type === "link" && (
          <Text style={{ color: "#2196F3", fontSize: 12, marginTop: 4 }}>
            Toca para ver el chat
          </Text>
        )}
        <Text style={styles.date}>{item.date}</Text>
      </View>
      {item.type === "link" && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#ccc"
          style={{ alignSelf: "center", marginLeft: 8 }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="checkmark-done" size={24} color="#00A896" />
              <Text style={styles.closeText}>Visto</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#FBB000"
              style={styles.loader}
            />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#ccc"
              />
              <Text style={styles.emptyText}>No tienes notificaciones</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              refreshing={isLoading}
              onRefresh={onRefresh}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", // Centrado verticalmente
    alignItems: "center", // Centrado horizontalmente
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    width: "100%",
    maxHeight: "80%", // Máximo 80% de la altura
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeText: {
    marginLeft: 5,
    color: "#00A896",
    fontWeight: "600",
  },
  listContent: {
    padding: 0,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  unreadItem: {
    backgroundColor: "#fef8e6", // Fondo ligero para no leídos
  },
  icon: {
    marginRight: 15,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    fontSize: 16,
  },
});
