import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Datos de ejemplo para las preguntas (Simulando JSON de API)
const FAQ_DATA = [
  {
    id: "1",
    question: "¿Desde qué subastas recogen vehículos?",
    answer:
      "Ofrecemos servicio de recogida desde las principales subastas de Estados Unidos, incluyendo Copart, IAA y Manheim. Solo necesitas el número de lote y la dirección del yard.",
  },
  {
    id: "2",
    question: "¿Cuánto cuesta el servicio de grúa?",
    answer:
      "El precio varía según la distancia y el tipo de vehículo. Al solicitar tu cotización, recibirás el costo exacto antes de confirmar.",
  },
  {
    id: "3",
    question: "¿Cuánto tarda el traslado desde la subasta?",
    answer:
      "El tiempo promedio es de 1 a 3 días hábiles una vez que el vehículo está listo para recoger.",
  },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  // Handlers para contacto
  const handleCall = () => Linking.openURL(`tel:${"+18005551234"}`); // Número temporal
  const handleEmail = () =>
    Linking.openURL(`mailto:soporte@unitedmotor.com?subject=Soporte App`);

  const renderFaqItem = ({ item }: any) => (
    <View style={styles.faqCard}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Soporte</Text>
      </View>

      <FlatList
        data={FAQ_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderFaqItem}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.topSection}>
            {/* <Text style={styles.welcomeText}>Bienvenido</Text> */}
            <Text style={styles.mainTitle}>¿Cómo podemos ayudarle?</Text>

            {/* BOTONES DE ACCIÓN RÁPIDA */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                <Ionicons name="call-outline" size={28} color="#FBB000" />
                <Text style={styles.actionLabel}>Llamar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={28} color="#FBB000" />
                <Text style={styles.actionLabel}>Enviar email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons
                  name="help-circle-outline"
                  size={28}
                  color="#FBB000"
                />
                <Text style={styles.actionLabel}>Preguntas</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              Nuestro equipo está disponible para ayudarte con cualquier
              consulta o problema relacionado con tu cuenta o tus servicios de
              grúa.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  topSection: { marginTop: 10 },
  welcomeText: { fontSize: 16, color: "#999", marginBottom: 5 },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#1A1A1A",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#FFF",
    // Sombras
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 25,
  },
  faqCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  faqAnswer: { fontSize: 14, color: "#555", lineHeight: 21 },
});
