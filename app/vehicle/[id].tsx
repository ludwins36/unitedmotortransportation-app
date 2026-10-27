import { AlertModal } from "@/components/ui/AlertModal";
import { StatusChangeSheet } from "@/components/vehicle/StatusChangeSheet";
import { StatusProofTimeline } from "@/components/vehicle/StatusProofTimeline";
import { WHATSAPP_SUPPORT_NUMBER } from "@/constants/config";
import { useAuth } from "@/context/AuthContext";
import { useVehiclesContext } from "@/context/VehiclesContext";
import { useAlertModal } from "@/hooks/useAlertModal";
import { useStatusProofs } from "@/hooks/useStatusProofs";
import { requestsService } from "@/services/requestsService";
import { Vehicle } from "@/types/vehicle";
import { formatPriceHNL } from "@/utils/formatCurrency";
import {
  ApiOrderStatus,
  getStatusDisplay,
  isActiveTransportStatus,
  mapApiStatusToApp,
  mapAppStatusToApi,
  ORDER_STATUS_OPTIONS,
} from "@/utils/orderStatus";
import { isDriver } from "@/utils/roles";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VehicleDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; vehicleData?: string }>();
  const { userData } = useAuth();
  const { getVehicleById, refreshVehicles, updateVehicleStatus } =
    useVehiclesContext();
  const { modalVisible, modalConfig, showModal, hideModal } = useAlertModal();
  const { proofs, isLoading: isLoadingProofs, refreshProofs } = useStatusProofs(
    params.id,
  );

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiOrderStatus | null>(null);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApiOrderStatus | null>(
    null,
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const driverCanChangeStatus = isDriver(userData);

  useEffect(() => {
    const id = params.id;
    let initial: Vehicle | null = null;

    if (params.vehicleData) {
      try {
        initial = JSON.parse(params.vehicleData) as Vehicle;
      } catch {
        initial = getVehicleById(id) ?? null;
      }
    } else {
      initial = getVehicleById(id) ?? null;
    }

    setVehicle(initial);
    if (initial) {
      setApiStatus(mapAppStatusToApi(initial.status));
    }
  }, [params.id, params.vehicleData]);

  useEffect(() => {
    const fromContext = getVehicleById(params.id);
    if (fromContext) {
      setVehicle(fromContext);
      setApiStatus(mapAppStatusToApi(fromContext.status));
    }
  }, [params.id, getVehicleById]);

  if (!vehicle) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Detalle",
            headerBackTitle: "Volver",
            headerStyle: { backgroundColor: "#FBB000" },
            headerTintColor: "#000",
          }}
        />
        <View style={[styles.centered, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.emptyText}>No se encontró el vehículo.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const statusInfo = getStatusDisplay(vehicle.status);
  const currentApiStatus = apiStatus ?? mapAppStatusToApi(vehicle.status);
  const canContactWhatsApp =
    isActiveTransportStatus(vehicle.status) &&
    WHATSAPP_SUPPORT_NUMBER.trim().length > 0;

  const openWhatsApp = () => {
    const number = WHATSAPP_SUPPORT_NUMBER.replace(/\D/g, "");
    if (!number) return;
    Linking.openURL(`https://wa.me/${number}`);
  };

  const handleStatusSelect = (newStatus: ApiOrderStatus) => {
    if (newStatus === currentApiStatus) {
      setStatusPickerVisible(false);
      return;
    }

    setStatusPickerVisible(false);
    setPendingStatus(newStatus);
  };

  const handleConfirmStatusChange = async (imageUri: string) => {
    if (!pendingStatus) return;

    const option = ORDER_STATUS_OPTIONS.find((o) => o.value === pendingStatus);
    setIsUpdatingStatus(true);

    try {
      const response = await requestsService.updateStatus(
        vehicle.id,
        pendingStatus,
        imageUri,
      );

      const responseStatus =
        (response as { status?: string })?.status ?? pendingStatus;
      const updatedStatus = mapApiStatusToApp(responseStatus);
      const updatedApiStatus = ORDER_STATUS_OPTIONS.some(
        (o) => o.value === responseStatus,
      )
        ? (responseStatus as ApiOrderStatus)
        : pendingStatus;

      setVehicle((prev) => (prev ? { ...prev, status: updatedStatus } : prev));
      setApiStatus(updatedApiStatus);
      updateVehicleStatus(vehicle.id, updatedStatus);
      setPendingStatus(null);
      refreshVehicles();
      refreshProofs();

      showModal(
        "Estado actualizado",
        `La orden ahora está en estado: ${option?.label ?? updatedStatus}. La evidencia fue registrada correctamente.`,
        "success",
      );
    } catch (error: any) {
      showModal(
        "Error",
        error?.message || "No se pudo actualizar el estado de la orden.",
        "error",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: vehicle.vin || "Detalle del vehículo",
          headerBackTitle: "Volver",
          headerStyle: { backgroundColor: "#FBB000" },
          headerTintColor: "#000",
          headerTitleStyle: { fontWeight: "bold", fontSize: 16 },
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {vehicle.foto_url ? (
            <Image
              source={{ uri: vehicle.foto_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="car-sport" size={64} color="#999" />
              <Text style={styles.imagePlaceholderText}>Sin foto</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {driverCanChangeStatus && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Estado de la orden</Text>
            <Text style={styles.driverHint}>
              Al cambiar el estado deberás adjuntar una foto como evidencia.
            </Text>
            <TouchableOpacity
              style={[
                styles.statusPickerBtn,
                isUpdatingStatus && styles.statusPickerBtnDisabled,
              ]}
              onPress={() => setStatusPickerVisible(true)}
              activeOpacity={0.7}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusInfo.color },
                    ]}
                  />
                  <Text style={styles.statusPickerText}>{statusInfo.text}</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <StatusProofTimeline proofs={proofs} isLoading={isLoadingProofs} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos del vehículo</Text>

          <View style={styles.row}>
            <Text style={styles.label}>VIN</Text>
            <Text style={styles.value}>{vehicle.vin || "—"}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Subasta</Text>
            <Text style={styles.value}>{vehicle.subasta || "—"}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Estado de la subasta</Text>
            <Text style={styles.value}>{vehicle.estadoSubasta || "—"}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Comprador</Text>
            <Text style={styles.value}>{vehicle.comprador || "—"}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>País</Text>
            <Text style={styles.value}>{vehicle.pais || "—"}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{vehicle.date || "—"}</Text>
          </View>

          {vehicle.price != null && (
            <>
              <View style={styles.separator} />
              <View style={styles.row}>
                <Text style={styles.label}>Precio</Text>
                <Text style={styles.priceValue}>
                  {formatPriceHNL(vehicle.price)}
                </Text>
              </View>
            </>
          )}

          {vehicle.factura_url ? (
            <>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL(vehicle.factura_url!)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#1D4ED8"
                />
                <Text style={styles.linkButtonText}>Ver factura</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {canContactWhatsApp && (
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={openWhatsApp}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={26} color="#FFF" />
            <Text style={styles.whatsappButtonText}>
              Contactar por WhatsApp
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={statusPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatusPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Seleccionar estado</Text>
                <Text style={styles.modalSubtitle}>Paso 1 de 2</Text>
              </View>
              <TouchableOpacity
                onPress={() => setStatusPickerVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ORDER_STATUS_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === currentApiStatus;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleStatusSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={22} color="#FBB000" />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.modalList}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <StatusChangeSheet
        visible={!!pendingStatus}
        currentStatus={currentApiStatus}
        newStatus={pendingStatus}
        isSubmitting={isUpdatingStatus}
        onClose={() => !isUpdatingStatus && setPendingStatus(null)}
        onConfirm={handleConfirmStatusChange}
        onPickError={(title, message) => showModal(title, message, "error")}
      />

      <AlertModal
        visible={modalVisible}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: { fontSize: 16, color: "#666", marginBottom: 20 },
  backBtn: {
    backgroundColor: "#FBB000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backBtnText: { fontWeight: "bold", fontSize: 16, color: "#000" },
  imageContainer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: { fontSize: 14, color: "#999", marginTop: 8 },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: { fontWeight: "600", fontSize: 14 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  driverHint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    marginTop: -8,
  },
  statusPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  statusPickerBtnDisabled: { opacity: 0.7 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusPickerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: { fontSize: 14, color: "#666", flex: 1 },
  value: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  priceValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
    textAlign: "right",
  },
  separator: { height: 1, backgroundColor: "#E5E7EB" },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  linkButtonText: { fontSize: 15, color: "#1D4ED8", fontWeight: "600" },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  whatsappButtonText: { fontSize: 17, fontWeight: "600", color: "#FFF" },
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
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  modalSubtitle: { fontSize: 12, color: "#92400E", marginTop: 4, fontWeight: "600" },
  modalList: { paddingHorizontal: 8 },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  modalOptionSelected: { backgroundColor: "#FFFBEB" },
  modalOptionText: { fontSize: 16, color: "#333" },
  modalOptionTextSelected: { fontWeight: "600", color: "#000" },
});
