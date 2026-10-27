import { HeaderNotificationBtn } from "@/components/HeaderNotificationBtn";
import { useAuth } from "@/context/AuthContext"; // Importar
import { isDriver } from "@/utils/roles"; // Importar
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  const { userData } = useAuth(); // Obtener userData

  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Habilitar Header en layout general
        headerStyle: {
          backgroundColor: "#FBB000", // Color del header
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: "bold",
          color: "#000",
        },
        headerRight: () => (
          <View style={{ marginRight: 15 }}>
            <HeaderNotificationBtn />
          </View>
        ), // Notificaciones en todos los tabs
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#FBB000",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 70,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false, // Home tiene su propio header custom
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Mensajes",
          href: isDriver(userData) ? null : "/(tabs)/messages",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Vehículos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="car-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          title: "Solicitud",
          href: isDriver(userData) ? null : "/(tabs)/request", // Ocultar si es driver
          tabBarIcon: ({ color }) => (
            <Ionicons name="build-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
