export const API_URL = "https://unitedmotortransportation.com/wp-json";

export const ENDPOINTS = {
  LOGIN: "/jwt-auth/v1/token",
  PASSWORD_RESET: "/united-motor/v1/password-reset",
  REGISTER: "/wc/v3/customers",
  REQUESTS: "/united-motor/v1/solicitudes",
  AVATAR: "/united-motor/v1/users/me/avatar",
  /** DELETE: elimina la cuenta del usuario autenticado (JWT). Debe existir en WordPress. */
  DELETE_ACCOUNT: "/united-motor/v1/users/me",
  NOTIFICATIONS: "/united-motor/v1/notifications",
};

export const WC_CONFIG = {
  CONSUMER_KEY: "ck_12a83c66a7a1ead2bfe694ffc25451ed89af05a6",
  CONSUMER_SECRET: "cs_451fa53817076c047b3e8d6cafe4c3b8ec3f9956",
};

/** Número de WhatsApp para soporte (solo dígitos, con código de país). Definir en .env como EXPO_PUBLIC_WHATSAPP_NUMBER */
export const WHATSAPP_SUPPORT_NUMBER =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_WHATSAPP_NUMBER) || "14109203660";
