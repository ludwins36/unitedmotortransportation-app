import { useProofImagePicker } from "@/hooks/useProofImagePicker";
import {
  ApiOrderStatus,
  getStatusDisplay,
  ORDER_STATUS_OPTIONS,
} from "@/utils/orderStatus";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StatusChangeSheetProps {
  visible: boolean;
  currentStatus: ApiOrderStatus;
  newStatus: ApiOrderStatus | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (imageUri: string) => void;
  onPickError?: (title: string, message: string) => void;
}

export function StatusChangeSheet({
  visible,
  currentStatus,
  newStatus,
  isSubmitting,
  onClose,
  onConfirm,
  onPickError,
}: StatusChangeSheetProps) {
  const insets = useSafeAreaInsets();
  const { pickProofImage } = useProofImagePicker(onPickError);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const currentInfo = getStatusDisplay(currentStatus);
  const newInfo = newStatus ? getStatusDisplay(newStatus) : null;
  const newLabel =
    ORDER_STATUS_OPTIONS.find((o) => o.value === newStatus)?.label ?? "";

  useEffect(() => {
    if (!visible) {
      setImageUri(null);
    }
  }, [visible]);

  const handlePickImage = async () => {
    const uri = await pickProofImage();
    if (uri) setImageUri(uri);
  };

  if (!newStatus) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmar cambio</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepBadge}>
            <Ionicons name="camera" size={16} color="#92400E" />
            <Text style={styles.stepBadgeText}>Paso 2 de 2 · Evidencia</Text>
          </View>

          <Text style={styles.title}>Adjunta una foto de respaldo</Text>
          <Text style={styles.subtitle}>
            Para actualizar el estado a{" "}
            <Text style={styles.subtitleStrong}>{newLabel}</Text>, es necesario
            subir una imagen como prueba del avance.
          </Text>

          <View style={styles.transitionCard}>
            <View style={styles.transitionItem}>
              <View
                style={[
                  styles.transitionDot,
                  { backgroundColor: currentInfo.color },
                ]}
              />
              <Text style={styles.transitionLabel}>Actual</Text>
              <Text style={styles.transitionValue}>{currentInfo.text}</Text>
            </View>

            <Ionicons name="arrow-forward" size={20} color="#999" />

            <View style={styles.transitionItem}>
              <View
                style={[
                  styles.transitionDot,
                  { backgroundColor: newInfo?.color ?? "#FBB000" },
                ]}
              />
              <Text style={styles.transitionLabel}>Nuevo</Text>
              <Text style={styles.transitionValue}>{newInfo?.text}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>
            Foto de evidencia <Text style={styles.required}>*</Text>
          </Text>

          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={handlePickImage}
                disabled={isSubmitting}
              >
                <Ionicons name="camera-reverse-outline" size={18} color="#000" />
                <Text style={styles.changePhotoText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handlePickImage}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              <View style={styles.uploadIconWrap}>
                <Ionicons name="camera-outline" size={30} color="#B45309" />
              </View>
              <Text style={styles.uploadTitle}>Tomar o elegir foto</Text>
              <Text style={styles.uploadHint}>
                Puede ser el vehículo, documento, puerto o punto de entrega
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#1D4ED8" />
            <Text style={styles.infoText}>
              Esta imagen quedará visible en el historial para el cliente y el
              conductor.
            </Text>
          </View>
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (!imageUri || isSubmitting) && styles.confirmBtnDisabled,
            ]}
            onPress={() => imageUri && onConfirm(imageUri)}
            disabled={!imageUri || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#000" />
                <Text style={styles.confirmBtnText}>Confirmar cambio</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    backgroundColor: "#FFF",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    width: 70,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  content: {
    padding: 20,
  },
  stepBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  stepBadgeText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 20,
  },
  subtitleStrong: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  transitionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  transitionItem: {
    flex: 1,
    alignItems: "center",
  },
  transitionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  transitionLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  transitionValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  required: {
    color: "#DC2626",
  },
  uploadArea: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#FBB000",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  uploadHint: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
  },
  previewWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#E5E7EB",
  },
  previewImage: {
    width: "100%",
    height: 240,
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FBB000",
    paddingVertical: 12,
  },
  changePhotoText: {
    fontWeight: "700",
    color: "#000",
    fontSize: 15,
  },
  infoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E3A8A",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FBB000",
    borderRadius: 14,
    paddingVertical: 16,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
});
