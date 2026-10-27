import { StatusProof } from "@/types/statusProof";
import { formatDateTime } from "@/utils/formatDate";
import { getStatusDisplay } from "@/utils/orderStatus";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StatusProofTimelineProps {
  proofs: StatusProof[];
  isLoading: boolean;
}

export function StatusProofTimeline({
  proofs,
  isLoading,
}: StatusProofTimelineProps) {
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de evidencias</Text>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#FBB000" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.cardTitle}>Historial de evidencias</Text>
            <Text style={styles.cardSubtitle}>
              Fotos registradas en cada cambio de estado
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{proofs.length}</Text>
          </View>
        </View>

        {proofs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={42} color="#CCC" />
            <Text style={styles.emptyTitle}>Sin evidencias aún</Text>
            <Text style={styles.emptyText}>
              Cuando el conductor actualice el estado con una foto, aparecerá
              aquí para que ambos puedan consultarla.
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {proofs.map((proof, index) => {
              const statusInfo = getStatusDisplay(proof.status);
              const isLast = index === proofs.length - 1;

              return (
                <View key={proof.id} style={styles.timelineItem}>
                  <View style={styles.timelineRail}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: statusInfo.color },
                      ]}
                    />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  <View style={styles.proofCard}>
                    <View style={styles.proofHeader}>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusInfo.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            { color: statusInfo.color },
                          ]}
                        >
                          {statusInfo.text}
                        </Text>
                      </View>
                      <Text style={styles.proofDate}>
                        {formatDateTime(proof.createdAt)}
                      </Text>
                    </View>

                    {proof.userName ? (
                      <Text style={styles.proofAuthor}>
                        Registrado por {proof.userName}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      style={styles.thumbnailWrap}
                      onPress={() => setViewerUri(proof.imageUrl)}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: proof.imageUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.thumbnailOverlay}>
                        <Ionicons name="expand-outline" size={18} color="#FFF" />
                        <Text style={styles.thumbnailOverlayText}>
                          Ver evidencia
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Modal
        visible={!!viewerUri}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerUri(null)}
      >
        <Pressable
          style={styles.viewerOverlay}
          onPress={() => setViewerUri(null)}
        >
          <TouchableOpacity
            style={styles.viewerClose}
            onPress={() => setViewerUri(null)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          {viewerUri ? (
            <Image
              source={{ uri: viewerUri }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    maxWidth: 260,
  },
  countBadge: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    minWidth: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countBadgeText: {
    fontWeight: "bold",
    color: "#92400E",
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  timeline: {
    gap: 4,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
  },
  timelineRail: {
    width: 18,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 18,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
    marginBottom: -8,
  },
  proofCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  proofHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  proofDate: {
    fontSize: 12,
    color: "#888",
    flexShrink: 1,
    textAlign: "right",
  },
  proofAuthor: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  thumbnailWrap: {
    borderRadius: 12,
    overflow: "hidden",
    height: 160,
    backgroundColor: "#E5E7EB",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailOverlay: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  thumbnailOverlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 2,
    padding: 8,
  },
  viewerImage: {
    width: "92%",
    height: "75%",
  },
});
