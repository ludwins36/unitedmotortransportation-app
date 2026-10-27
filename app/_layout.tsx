import { AuthProvider } from "@/context/AuthContext";
import { VehiclesProvider } from "@/context/VehiclesContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VehiclesProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="vehicle/[id]"
                options={{
                  headerShown: true,
                  headerBackTitle: "Volver",
                  headerStyle: { backgroundColor: "#FBB000" },
                  headerTintColor: "#000",
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </VehiclesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
