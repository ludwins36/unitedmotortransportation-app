import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string | null;
  type?: "error" | "success" | "info";
  buttonText?: string;
}

export function AlertModal({
  visible,
  onClose,
  title,
  message,
  type = "error",
  buttonText = "Entendido",
}: AlertModalProps) {
  const { width } = useWindowDimensions();

  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "info":
        return "information-circle";
      case "error":
      default:
        return "alert-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "info":
        return "#2196F3";
      case "error":
      default:
        return "#FF3B30";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIconName()} size={40} color={getIconColor()} />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          {message && (
            <RenderHtml
              contentWidth={width * 0.8 - 50}
              source={{ html: message }}
              baseStyle={{
                fontSize: 16,
                color: "#666",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 20,
              }}
            />
          )}
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#FBB000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
