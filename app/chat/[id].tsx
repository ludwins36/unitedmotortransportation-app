import { isActiveTransportStatus } from "@/utils/orderStatus";
import { useChat } from "@/hooks/useChat";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Vehicle } from "../../types/vehicle";

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, vehicleData } = params;

  // Manejo más robusto de vehicleData
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (vehicleData) {
      try {
        const parsedData =
          typeof vehicleData === "string"
            ? JSON.parse(vehicleData)
            : vehicleData;
        setVehicle(parsedData);
      } catch (e) {
        console.error("Error parsing vehicle data", e);
      }
    }
  }, [vehicleData]);

  // Hook que se conecta a /solicitudes/{id}/chat (GET y POST)
  const { messages, isLoading, fetchMessages, sendMessage } = useChat(
    Array.isArray(id) ? id[0] : (id as string) || "",
  );
  const [inputText, setInputText] = useState("");

  // Cargar mensajes al entrar y hacer polling ligero
  useEffect(() => {
    if (!id) return;
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [id, fetchMessages]);

  // Log cada vez que cambian los mensajes
  useEffect(() => {
    if (!messages) return;
  }, [messages]);

  const isChatEnabled = vehicle ? isActiveTransportStatus(vehicle.status) : false;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText.trim());
    setInputText("");
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.adminMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.adminText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.adminTimestamp,
          ]}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: vehicle ? `Chat: ${vehicle.vin}` : "Chat",
          headerBackTitle: "Vehículos",
        }}
      />

      {/* Vehicle Info Summary */}
      {vehicle && (
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {vehicle.subasta} - {vehicle.estadoSubasta}
          </Text>
          <Text style={styles.headerSubtitle}>Status: {vehicle.status}</Text>
        </View>
      )}

      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay mensajes aún.</Text>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={styles.keyboardAvoidingView}
      >
        {isChatEnabled ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.disabledContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#666" />
            <Text style={styles.disabledText}>
              Chat disponible solo para estatus Aprobada y En Tránsito
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
    borderBottomRightRadius: 4,
  },
  adminMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: "#FFFFFF",
  },
  adminText: {
    color: "#1F2937",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  adminTimestamp: {
    color: "#9CA3AF",
  },
  keyboardAvoidingView: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  sendButton: {
    backgroundColor: "#2563EB",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#E5E7EB",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
  },
  disabledText: {
    marginLeft: 8,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
});
