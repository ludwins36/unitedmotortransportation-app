import { AlertModal } from "@/components/ui/AlertModal";
import { useAuthForm } from "@/hooks/useAuthForm";
import { authService } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "react-native-international-phone-number";

// Paleta de la app - colores y medidas para formulario simétrico
const PALETTE = {
  primary: "#FBB000",
  background: "#F0F2F5",
  surface: "#FFFFFF",
  border: "#E0DED9",
  placeholder: "#999999",
  text: "#1A1A1A",
  textSecondary: "#666666",
  inputBg: "#FAFAFA",
} as const;

const INPUT_HEIGHT = 50;
const INPUT_BORDER_RADIUS = 25;
const INPUT_PADDING_H = 20;
const INPUT_MARGIN_BOTTOM = 16;
const INPUT_FONT_SIZE = 16;

export default function AuthScreen() {
  const phoneInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    isLogin,
    setIsLogin,
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
    setError,
  } = useAuthForm();

  const openPasswordReset = () => {
    setResetEmail(formData.email.trim());
    setResetModalVisible(true);
  };

  const submitPasswordReset = async () => {
    const email = resetEmail.trim();
    if (!email || !email.includes("@")) {
      setError("Ingresa un email válido para recuperar tu contraseña.");
      return;
    }
    setResetLoading(true);
    setError(null);
    try {
      const data = await authService.requestPasswordReset(email);
      setResetModalVisible(false);
      const msg =
        typeof data?.message === "string"
          ? data.message
          : "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.";
      setSuccessMessage(msg);
    } catch (err: any) {
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "No se pudo enviar el correo de recuperación. Intenta más tarde.";
      setError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AlertModal
        visible={!!error}
        onClose={() => setError(null)}
        title="¡Atención!"
        message={error}
        type="error"
      />
      <AlertModal
        visible={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Correo enviado"
        message={successMessage}
        type="success"
        buttonText="Entendido"
      />

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/United-Motor_Logo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>

      <View style={styles.formContainer}>
        <KeyboardAvoidingView
          style={styles.formKeyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={!isLogin ? styles.activeTab : styles.inactiveTab}
                onPress={() => setIsLogin(false)}
              >
                <Text
                  style={!isLogin ? styles.activeTabText : styles.inactiveTabText}
                >
                  Crea tu cuenta
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={isLogin ? styles.activeTab : styles.inactiveTab}
                onPress={() => setIsLogin(true)}
              >
                <Text
                  style={isLogin ? styles.activeTabText : styles.inactiveTabText}
                >
                  Ingresar
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Ingresa tus credenciales para acceder a tu cuenta."
                : "Por favor llena tus datos para crear tu cuenta por primera vez."}
            </Text>

            <View style={styles.inputIconWrapper}>
              <View style={styles.inputIconBox}>
                <Ionicons name="mail-outline" size={22} color={PALETTE.textSecondary} />
              </View>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Email"
                placeholderTextColor={PALETTE.placeholder}
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor={PALETTE.primary}
              />
            </View>
            <View style={styles.inputIconWrapper}>
              <View style={styles.inputIconBox}>
                <Ionicons name="lock-closed-outline" size={22} color={PALETTE.textSecondary} />
              </View>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Password"
                placeholderTextColor={PALETTE.placeholder}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                selectionColor={PALETTE.primary}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={PALETTE.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={openPasswordReset}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            )}

            {!isLogin && (
              <>
                <View style={styles.inputIconWrapper}>
                  <View style={styles.inputIconBox}>
                    <Ionicons name="person-outline" size={22} color={PALETTE.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Nombre completo"
                    placeholderTextColor={PALETTE.placeholder}
                    value={formData.fullName}
                    onChangeText={(text) => handleChange("fullName", text)}
                    selectionColor={PALETTE.primary}
                  />
                </View>
                <View style={styles.inputIconWrapper}>
                  <View style={styles.inputIconBox}>
                    <Ionicons name="business-outline" size={22} color={PALETTE.textSecondary} />
                  </View>
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="Nombre de empresa"
                    placeholderTextColor={PALETTE.placeholder}
                    value={formData.companyName}
                    onChangeText={(text) => handleChange("companyName", text)}
                    selectionColor={PALETTE.primary}
                  />
                </View>
                <View style={styles.inputIconWrapper}>
                  <View style={styles.inputIconBox}>
                    <Ionicons name="call-outline" size={22} color={PALETTE.textSecondary} />
                  </View>
                  <PhoneInput
                    ref={phoneInputRef}
                    defaultCountry="MX"
                    value={formData.phone}
                    onChangePhoneNumber={(phoneNumber) =>
                      handleChange("phone", phoneNumber)
                    }
                    placeholder="Teléfono de contacto"
                    phoneInputPlaceholderTextColor={PALETTE.placeholder}
                    phoneInputSelectionColor={PALETTE.primary}
                    phoneInputStyles={{
                      container: styles.phoneContainerInner,
                      flagContainer: styles.phoneFlagContainer,
                      flag: styles.phoneFlag,
                      callingCode: styles.phoneCallingCode,
                      input: styles.phoneInputInner,
                      caret: styles.phoneCaret,
                      divider: styles.phoneDivider,
                    }}
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? "Ingresar" : "Registrarme"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !resetLoading && setResetModalVisible(false)}
      >
        <View style={styles.resetModalOverlay}>
          <View style={styles.resetModalCard}>
            <Text style={styles.resetModalTitle}>Recuperar contraseña</Text>
            <Text style={styles.resetModalSubtitle}>
              Te enviaremos un correo con instrucciones para restablecer tu
              contraseña.
            </Text>
            <View style={styles.inputIconWrapper}>
              <View style={styles.inputIconBox}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={PALETTE.textSecondary}
                />
              </View>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Email"
                placeholderTextColor={PALETTE.placeholder}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                selectionColor={PALETTE.primary}
                editable={!resetLoading}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, resetLoading && styles.buttonDisabled]}
              onPress={submitPasswordReset}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Enviar enlace</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetModalCancel}
              onPress={() => setResetModalVisible(false)}
              disabled={resetLoading}
            >
              <Text style={styles.resetModalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  logoContainer: {
    height: "25%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  formContainer: {
    flex: 1,
    backgroundColor: PALETTE.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formKeyboardAvoid: { flex: 1 },
  formScroll: { flex: 1 },
  formScrollContent: { paddingBottom: 16 },
  buttonContainer: { paddingTop: 16 },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: PALETTE.primary,
    paddingBottom: 10,
    marginRight: 20,
  },
  activeTabText: {
    fontWeight: "bold",
    fontSize: 16,
    color: PALETTE.text,
  },
  inactiveTab: { paddingBottom: 10, marginRight: 20 },
  inactiveTabText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: PALETTE.text,
  },
  subtitle: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    marginBottom: 20,
  },
  inputIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: INPUT_BORDER_RADIUS,
    marginBottom: INPUT_MARGIN_BOTTOM,
    backgroundColor: PALETTE.inputBg,
    overflow: "hidden",
    paddingRight: 8,
  },
  inputIconBox: {
    width: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWithIcon: {
    flex: 1,
    height: INPUT_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: INPUT_FONT_SIZE,
    color: PALETTE.text,
  },
  passwordToggle: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: INPUT_MARGIN_BOTTOM,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: PALETTE.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  resetModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resetModalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: PALETTE.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  resetModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: PALETTE.text,
    marginBottom: 8,
  },
  resetModalSubtitle: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  resetModalCancel: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  resetModalCancelText: {
    fontSize: 16,
    color: PALETTE.textSecondary,
    fontWeight: "600",
  },
  phoneContainerInner: {
    flex: 1,
    height: INPUT_HEIGHT,
    borderWidth: 0,
    borderRadius: 0,
    marginBottom: 0,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  phoneFlagContainer: {
    paddingLeft: 8,
    paddingRight: 6,
    height: INPUT_HEIGHT,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  phoneFlag: {
    color: PALETTE.textSecondary,
    fontSize: 16,
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: PALETTE.border,
    marginRight: 6,
  },
  phoneCallingCode: {
    fontSize: INPUT_FONT_SIZE,
    color: PALETTE.text,
    fontWeight: "500",
  },
  phoneCaret: {
    fontSize: 10,
    color: PALETTE.textSecondary,
    marginLeft: 4,
  },
  phoneInputInner: {
    flex: 1,
    fontSize: INPUT_FONT_SIZE,
    color: PALETTE.text,
    height: INPUT_HEIGHT,
    paddingVertical: 0,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  button: {
    backgroundColor: PALETTE.primary,
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: PALETTE.text,
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonDisabled: { opacity: 0.7 },
});
