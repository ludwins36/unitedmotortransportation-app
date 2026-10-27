import { AlertModal } from "@/components/ui/AlertModal";
import { ENDPOINTS } from "@/constants/config";
import { useAuth } from "@/context/AuthContext";
import { useAlertModal } from "@/hooks/useAlertModal";
import { apiFetch } from "@/services/apiClient";
import { Alert } from "@/utils/Alert";
import { isDriver } from "@/utils/roles"; // Importar utilidad
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react"; // Importar useEffect
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SubastaItem = { name: string; price: string };
type SubastasByState = { state: string; subastas: SubastaItem[] };

const subastasData = require("@/data/subastas.json") as SubastasByState[];

const ESTADOS_USA = subastasData.map((item) => item.state);

export default function RequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [redirectOnClose, setRedirectOnClose] = useState(false);

  // Hook para el Modal Personalizado
  const { modalVisible, modalConfig, showModal, hideModal } = useAlertModal();
  const { userToken, userData } = useAuth(); // Obtener userData

  useEffect(() => {
    if (userData && isDriver(userData)) {
      Alert.alert(
        "Acceso denegado",
        "Los conductores no pueden crear solicitudes.",
      );
      router.replace("/(tabs)/vehicles"); // O home
    }
  }, [userData]);

  const [form, setForm] = useState({
    vin: "",
    subasta: "",
    comprador: "",
    pais: "Estados Unidos",
    estado: "",
  });
  const [estadoPickerVisible, setEstadoPickerVisible] = useState(false);
  const [subastaPickerVisible, setSubastaPickerVisible] = useState(false);

  const subastasDelEstado = form.estado
    ? subastasData.find((s) => s.state === form.estado)?.subastas ?? []
    : [];

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setPdfName(result.assets[0].name);
      setPdfUri(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    if (Platform.OS === "web") {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
      return;
    }

    Alert.alert("Foto del vehículo", "¿Cómo deseas agregar la foto?", [
      {
        text: "Cámara",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            showModal(
              "Permiso denegado",
              "Se necesita acceso a la cámara para tomar fotos.",
              "error",
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            showModal(
              "Permiso denegado",
              "Se necesita acceso a la galería para seleccionar fotos.",
              "error",
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSolicitud = async () => {
    if (
      !form.vin ||
      !form.subasta ||
      !form.comprador ||
      !form.pais ||
      !form.estado
    ) {
      showModal(
        "Campos requeridos",
        "Por favor completa todos los campos para continuar.",
        "error",
      );
      return;
    }

    if (!pdfName) {
      showModal(
        "Factura requerida",
        "Por favor adjunta la factura PDF del vehículo.",
        "error",
      );
      return;
    }

    if (!image) {
      showModal(
        "Foto requerida",
        "Por favor agrega una foto del vehículo.",
        "error",
      );
      return;
    }

    // Construcción del FormData para enviar a la API
    const formData = new FormData();
    formData.append("vin", form.vin);
    formData.append("subasta", form.subasta);
    formData.append("comprador", form.comprador);
    formData.append("estadoSubasta", form.estado);
    formData.append("pais", form.pais);

    // Adjuntar PDF (asumiendo que tienes el URI y el tipo, aquí usando valores simulados para el ejemplo si solo tienes el nombre)
    // Nota: Para enviar archivos reales, necesitarías el objeto completo del DocumentPicker o el URI
    // Aquí solo estamos validando que se haya seleccionado algo.
    // Si tuvieras el objeto `docResult` guardado en el estado:
    // formData.append('factura', { uri: docResult.assets[0].uri, name: docResult.assets[0].name, type: docResult.assets[0].mimeType } as any);

    // Adjuntar Imagen
    // const filename = image.split("/").pop();
    // const match = /\.(\w+)$/.exec(filename ?? "");
    // const type = match ? `image/${match[1]}` : `image`;

    // formData.append("foto", {
    //   uri: image,
    //   name: filename,
    //   type,
    // } as any);

    // formData.append("factura", {
    //   uri: pdfUri,
    //   name: pdfName,
    //   type: "application/pdf",
    // } as any);

    if (image) {
      if (Platform.OS === "web") {
        const res = await fetch(image);
        const blob = await res.blob();
        formData.append("foto", blob, "foto.jpg");
      } else {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("foto", {
          uri: Platform.OS === "ios" ? image.replace("file://", "") : image, // Limpieza de URI
          name: filename || "foto.jpg",
          type: type,
        } as any);
      }
    }

    // --- CORRECCIÓN PARA EL PDF ---
    if (pdfUri) {
      if (Platform.OS === "web") {
        const res = await fetch(pdfUri);
        const blob = await res.blob();
        formData.append("factura", blob, pdfName || "factura.pdf");
      } else {
        formData.append("factura", {
          uri: Platform.OS === "ios" ? pdfUri.replace("file://", "") : pdfUri, // Limpieza de URI
          name: pdfName || "factura.pdf",
          type: "application/pdf",
        } as any);
      }
    }

    console.log("🚀 ~ Ready to send FormData:", formData);
    console.log("Archivo Foto:", formData.get("foto"));
    console.log("Archivo Factura:", formData.get("factura"));

    setLoading(true);

    try {
      // Enviar solicitud a la API
      const response = await apiFetch(ENDPOINTS.REQUESTS, {
        method: "POST",
        body: formData,
        // Al enviar FormData, NO debemos establecer 'Content-Type' manualmente.
        // El navegador/fetch lo establecerá automáticamente con el boundary correcto.
        headers: {
          // Sobrescribimos 'Content-Type' a undefined para que el navegador lo maneje
          Authorization: `Bearer ${userToken}`, // Token de autenticación
        },
      });

      console.log("🚀 ~ Respuesta API:", response);

      setLoading(false);

      // Limpiar formulario y estado
      setForm({
        vin: "",
        subasta: "",
        comprador: "",
        pais: "Estados Unidos",
        estado: "",
      });
      setPdfName(null);
      setPdfUri(null);
      setImage(null);

      setRedirectOnClose(true); // Redirigir al cerrar el modal
      showModal(
        "Solicitud Exitosa",
        "Tu solicitud ha sido recibida correctamente. Nos pondremos en contacto pronto.",
        "success",
      );
    } catch (error: any) {
      console.error("Error al enviar solicitud:", error);
      setLoading(false);
      showModal(
        "Error",
        error.message ||
          "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.",
        "error",
      );
    }
  };

  const handleModalClose = () => {
    hideModal();
    if (redirectOnClose) {
      setRedirectOnClose(false);
      // Navegar a la pestaña de vehículos
      // En Expo Router/Tabs, navegar a una ruta de pestaña cambia a esa pestaña
      router.push("/(tabs)/vehicles");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <AlertModal
        visible={modalVisible}
        onClose={handleModalClose}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
      <ScrollView
        style={[styles.container, { paddingTop: insets.top + 20 }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Solicitar Grúa</Text>
          <Text style={styles.subtitle}>
            Ingresa los datos del vehículo para cotizar
          </Text>
        </View>

        <View style={styles.card}>
          {/* Campo VIN */}
          <Text style={styles.label}>Número de VIN</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="barcode-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Ej: 1HGBH41..."
              value={form.vin}
              onChangeText={(val) => setForm({ ...form, vin: val })}
            />
          </View>

          {/* Campo Comprador */}
          <Text style={styles.label}>Comprador</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre del comprador"
              value={form.comprador}
              onChangeText={(val) => setForm({ ...form, comprador: val })}
            />
          </View>

          {/* País */}
          <Text style={styles.label}>País de destino</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="flag-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              value={form.pais}
              editable={false}
            />
          </View>

          {/* Estado (USA) - desde subastas.json */}
          <Text style={styles.label}>Estado</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setEstadoPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <Text
              style={[styles.input, !form.estado && { color: "#999" }]}
              numberOfLines={1}
            >
              {form.estado || "Selecciona un estado"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Modal
            visible={estadoPickerVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setEstadoPickerVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setEstadoPickerVisible(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Estados (Estados Unidos)</Text>
                  <TouchableOpacity
                    onPress={() => setEstadoPickerVisible(false)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={ESTADOS_USA}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setForm((prev) => ({
                          ...prev,
                          estado: item,
                          subasta: "",
                        }));
                        setEstadoPickerVisible(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.modalList}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Subasta - select según estado seleccionado */}
          <Text style={styles.label}>Subasta (Donde se compró)</Text>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              !form.estado && styles.inputContainerDisabled,
            ]}
            onPress={() => form.estado && setSubastaPickerVisible(true)}
            activeOpacity={0.7}
            disabled={!form.estado}
          >
            <Ionicons
              name="business-outline"
              size={20}
              color={form.estado ? "#666" : "#999"}
              style={styles.icon}
            />
            <Text
              style={[
                styles.input,
                !form.subasta && { color: "#999" },
              ]}
              numberOfLines={1}
            >
              {form.subasta ||
                (form.estado
                  ? "Selecciona una subasta"
                  : "Selecciona primero un estado")}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={form.estado ? "#666" : "#999"}
            />
          </TouchableOpacity>

          <Modal
            visible={subastaPickerVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setSubastaPickerVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setSubastaPickerVisible(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Subastas {form.estado ? `- ${form.estado}` : ""}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSubastaPickerVisible(false)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={subastasDelEstado}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, subasta: item.name }));
                        setSubastaPickerVisible(false);
                      }}
                    >
                      <View style={styles.modalOptionContent}>
                        <Text style={styles.modalOptionText}>{item.name}</Text>
                        {item.price ? (
                          <Text style={styles.modalOptionPrice}>{item.price}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  )}
                  style={styles.modalList}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Adjuntar Factura */}
          <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
            <Ionicons name="document-attach-outline" size={24} color="#000" />
            <Text style={styles.uploadBtnText}>
              {pdfName ? `Archivo: ${pdfName}` : "Adjuntar Factura PDF"}
            </Text>
          </TouchableOpacity>

          {/* Foto del vehículo */}
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Ionicons name="camera-outline" size={24} color="#000" />
            <Text style={styles.uploadBtnText}>
              {image ? "Cambiar foto" : "Foto del vehículo"}
            </Text>
          </TouchableOpacity>

          {image && (
            <Image
              source={{ uri: image }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          )}

          {/* Botón Principal */}
          <TouchableOpacity
            style={[styles.mainButton, loading && { opacity: 0.7 }]}
            onPress={handleSolicitud}
            disabled={loading}
          >
            <Text style={styles.mainButtonText}>
              {loading ? "Procesando..." : "Solicitar grúa"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 5 },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
    marginBottom: 8,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16, color: "#000" },
  inputContainerDisabled: { opacity: 0.7 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#999",
  },
  uploadBtnText: { marginLeft: 10, fontWeight: "600", fontSize: 15 },
  mainButton: {
    backgroundColor: "#FBB000",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  mainButtonText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  modalList: {
    maxHeight: 400,
    paddingBottom: 24,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  modalOptionContent: { flex: 1 },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalOptionPrice: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
