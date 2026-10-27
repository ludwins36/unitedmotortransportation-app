import { useVehicles } from "@/hooks/useVehicles";
import { Vehicle } from "@/types/vehicle";
import { formatPriceHNL } from "@/utils/formatCurrency";
import { getStatusDisplay, ORDER_STATUS_OPTIONS } from "@/utils/orderStatus";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/** Cambiar a true cuando se habilite el chat en una versión futura */
const ENABLE_CHAT_NAVIGATION = false;
import React from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VehiclesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Use the hook for logic and data
  const {
    vehicles,
    refetch,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
  } = useVehicles();

  // Component for a vehicle card
  const renderItem = ({ item }: { item: Vehicle }) => {
    const statusInfo = getStatusDisplay(item.status);

    return (
      <TouchableOpacity
        onPress={() => {
          if (ENABLE_CHAT_NAVIGATION) {
            router.push({
              pathname: "/chat/[id]",
              params: {
                id: item.id,
                vehicleData: JSON.stringify(item),
              },
            });
          } else {
            router.push({
              pathname: "/vehicle/[id]",
              params: {
                id: item.id,
                vehicleData: JSON.stringify(item),
              },
            });
          }
        }}
        activeOpacity={0.8}
      >
        <View style={styles.card}>
          {/* Vehicle Large Icon */}
          <View style={styles.cardIcon}>
            {item.foto_url ? (
              <Image
                source={{ uri: item.foto_url }}
                style={{ width: "100%", height: "100%", borderRadius: 10 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="car-sport" size={32} color="#555" />
            )}
          </View>

          {/* Info */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {item.subasta} - {item.estadoSubasta}
            </Text>
            <Text style={styles.cardSubtitle}>VIN: {item.vin}</Text>
            <Text style={styles.cardSubtitle}>
              {item.comprador} • {item.date}
            </Text>
            {item.price != null && (
              <Text style={styles.cardPrice}>
                {formatPriceHNL(item.price)}
              </Text>
            )}
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusInfo.bg,
                borderColor: statusInfo.color,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Vehículos</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por marca, modelo o placa..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTERS (Tabs) */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {[
            { key: "all", label: "Todos" },
            ...ORDER_STATUS_OPTIONS.map((option) => ({
              key: option.value,
              label: option.label,
            })),
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterPill,
                filterStatus === filter.key && styles.filterPillActive,
              ]}
              onPress={() => setFilterStatus(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST OF RESULTS */}
      <FlatList
        data={vehicles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={["#FBB000"]} // Android
            tintColor="#FBB000" // iOS
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>No se encontraron vehículos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#FBB000",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },

  // Filters
  filtersContainer: { flexDirection: "row", marginBottom: 15 },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFF",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterPillActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  filterText: { color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#FBB000", fontWeight: "bold" },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  cardSubtitle: { fontSize: 14, color: "#666", marginTop: 2 },
  cardPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 6,
  },
  cardVin: { fontSize: 12, color: "#999", marginTop: 2 },

  // Status Badges
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 120,
  },

  statusText: { fontSize: 13, fontWeight: "600" },

  // Empty State
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#999", marginTop: 10, fontSize: 16 },
});
