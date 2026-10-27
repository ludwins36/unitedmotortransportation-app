import { Alert } from "@/utils/Alert";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { Platform } from "react-native";

export function useProofImagePicker(
  onError?: (title: string, message: string) => void,
) {
  const showError = onError ?? ((title, message) => Alert.alert(title, message));

  const pickFromLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError(
        "Permiso denegado",
        "Se necesita acceso a la galería para seleccionar fotos.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  }, [showError]);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showError(
        "Permiso denegado",
        "Se necesita acceso a la cámara para tomar fotos.",
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  }, [showError]);

  const pickProofImage = useCallback(async () => {
    if (Platform.OS === "web") {
      return pickFromLibrary();
    }

    return new Promise<string | null>((resolve) => {
      Alert.alert("Evidencia fotográfica", "¿Cómo deseas agregar la foto?", [
        {
          text: "Cámara",
          onPress: async () => resolve(await pickFromCamera()),
        },
        {
          text: "Galería",
          onPress: async () => resolve(await pickFromLibrary()),
        },
        { text: "Cancelar", style: "cancel", onPress: () => resolve(null) },
      ]);
    });
  }, [pickFromCamera, pickFromLibrary]);

  return { pickProofImage };
}
