import { HeaderNotificationBtn } from "@/components/HeaderNotificationBtn";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { isDriver } from "@/utils/roles"; // Importar utilidad
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router"; // Importamos useRouter
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { userData, signOut, updateUserData } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter(); // Inicializamos router
  const [isUploading, setIsUploading] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const openDeleteAccountWarning = () => setDeleteAccountVisible(true);

  const confirmDeleteAccount = async () => {
    setDeleteAccountLoading(true);
    try {
      await authService.deleteAccount();
      setDeleteAccountVisible(false);
      await signOut();
      Alert.alert(
        "Cuenta eliminada",
        "Tu cuenta ha sido borrada. Gracias por haber usado United Motor Transportation.",
      );
    } catch (err: any) {
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "No se pudo eliminar la cuenta. Intenta más tarde o contacta soporte.";
      Alert.alert("No se pudo borrar la cuenta", msg);
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const handleUpload = async (uri: string) => {
    try {
      setIsUploading(true);
      const response = await authService.uploadAvatar(uri);
      // Asumimos que la respuesta trae la nueva URL en user.avatar_url o similar
      // Dependiendo de cómo responda tu backend (WordPress/WooCommerce/Custom)
      console.log("🚀 ~ handleUpload ~ response:", response);
      if (response && response.data && response.data.avatar_url) {
        // Actualizamos contexto global
        await updateUserData({
          ...userData,
          avatar_url: response.data.avatar_url,
        });
        Alert.alert("Éxito", "Foto de perfil actualizada correctamente.");
      } else {
        // Si no, tal vez solo refrescar el usuario completo
        // O si devuelve el usuario entero:
        // await updateUserData(response);
        Alert.alert(
          "Aviso",
          "Foto subida, pero no pudimos actualizar la vista previa inmediatamente.",
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar la foto de perfil.");
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    if (Platform.OS === "web") {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        handleUpload(result.assets[0].uri);
      }
      return;
    }

    Alert.alert("Actualizar Foto", "¿Cómo deseas actualizar tu foto?", [
      {
        text: "Cámara",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permiso necesario", "Se requiere acceso a la cámara.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: false,
          });
          if (!result.canceled) {
            handleUpload(result.assets[0].uri);
          }
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permiso necesario",
              "Se requiere acceso a la galería.",
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: false,
          });
          if (!result.canceled) {
            handleUpload(result.assets[0].uri);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F0F2F5" }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <ImageBackground
          source={require("@/assets/images/portada.png")}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20 }}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={pickImage}
                activeOpacity={0.8}
                disabled={isUploading}
              >
                <View style={styles.avatarPlaceholder}>
                  {isUploading ? (
                    <ActivityIndicator color="#666" size="small" />
                  ) : userData?.avatar_url ? (
                    <Image
                      source={{ uri: userData.avatar_url }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={60} color="#666" />
                  )}
                  <View style={styles.editBadge}>
                    <Ionicons name="camera" size={14} color="#FFF" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Header Right */}
              <View style={styles.notificationWrapper}>
                <HeaderNotificationBtn
                  style={{ backgroundColor: "#000", elevation: 0 }}
                />
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* TARJETA DE BIENVENIDA */}
        <View style={styles.mainContent}>
          <View style={styles.welcomeCard}>
            <Image
              source={require("@/assets/images/United-Motor_Logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>
              Bienvenido
            </Text>
            <Text style={styles.userName}>
              {userData?.name || userData?.display_name ? `, ${userData.name || userData.display_name}` : "Cargando..."}
            </Text>
            <Text style={styles.userCompany}>
              {userData?.company || "Empresa no asignada"}
            </Text>
          </View>

          {/* SECCIÓN DE SERVICIOS */}
          <View style={styles.servicesCard}>
            <Text style={styles.priorityText}>
              Tu vehículo, nuestra prioridad. Solicita tu grúa en minutos.
            </Text>

            {!isDriver(userData) && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/(tabs)/request")} // Navega a Cotizar
              >
                <Ionicons
                  name="bus"
                  size={20}
                  color="black"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Cotizar servicio de grúa</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(tabs)/vehicles")} // Navega a Mis Vehículos
            >
              <Ionicons
                name="car"
                size={20}
                color="black"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Mis vehículos</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutLink} onPress={signOut}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={openDeleteAccountWarning}
            activeOpacity={0.85}
          >
            <Ionicons name="trash-outline" size={18} color="#B00020" />
            <Text style={styles.deleteAccountButtonText}>
              Borrar mi cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Espacio extra al final para que el scroll no quede tapado por los tabs */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={deleteAccountVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          !deleteAccountLoading && setDeleteAccountVisible(false)
        }
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteModalIconWrap}>
              <Ionicons name="warning" size={56} color="#FF3B30" />
            </View>
            <Text style={styles.deleteModalTitle}>¿Eliminar tu cuenta?</Text>
            <Text style={styles.deleteModalHighlight}>
              Esta acción es permanente y no se puede deshacer.
            </Text>
            <Text style={styles.deleteModalBody}>
              Se borrarán tus datos de acceso y dejarás de poder usar la app con
              esta cuenta. Si tienes dudas, contacta soporte antes de continuar.
            </Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteModalCancel}
                onPress={() => setDeleteAccountVisible(false)}
                disabled={deleteAccountLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirm}
                onPress={confirmDeleteAccount}
                disabled={deleteAccountLoading}
                activeOpacity={0.85}
              >
                {deleteAccountLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.deleteModalConfirmText}>
                    Sí, borrar mi cuenta
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  headerBackground: {
    height: 220,
    width: "100%",
  },
  headerContent: {
    padding: 20,
    alignItems: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  notificationWrapper: {
    marginTop: 35,
  },
  profileBadge: {
    backgroundColor: "#00A896",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  avatarContainer: {
    marginTop: 20,
    alignSelf: "flex-start",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
    position: "relative", // Para el badge absoluto
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FBB000",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: -30, // Eleva el contenido sobre la imagen
  },
  welcomeCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 22,
    color: "#333",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 2,
  },
  userCompany: {
    fontSize: 16,
    color: "#777",
  },
  deleteAccountButton: {
    marginTop: 16,
    marginBottom: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E53935",
    backgroundColor: "#FFF5F5",
    width: "100%",
  },
  deleteAccountButtonText: {
    color: "#B00020",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    borderWidth: 3,
    borderColor: "#FF3B30",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  deleteModalIconWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  deleteModalTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  deleteModalHighlight: {
    color: "#FF6B6B",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  deleteModalBody: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  deleteModalActions: {
    gap: 12,
  },
  deleteModalCancel: {
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteModalCancelText: {
    color: "#EEE",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteModalConfirm: {
    backgroundColor: "#C62828",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF5252",
  },
  deleteModalConfirmText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },
  servicesCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  priorityText: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: "#FBB000", // El amarillo de tu marca
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutLink: {
    marginTop: 20,
    alignItems: "center",
    marginBottom: 0,
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  bottomTab: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#FBB000",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});
