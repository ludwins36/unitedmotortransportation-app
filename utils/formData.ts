import { Platform } from "react-native";

export async function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  uri: string,
) {
  const filename = uri.split("/").pop() || "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  if (Platform.OS === "web") {
    const res = await fetch(uri);
    const blob = await res.blob();
    formData.append(fieldName, blob, filename);
    return;
  }

  formData.append(fieldName, {
    uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
    name: filename,
    type,
  } as any);
}
