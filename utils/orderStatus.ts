import { VehicleStatus } from "@/types/vehicle";

export type ApiOrderStatus = VehicleStatus;

export const ORDER_STATUS_OPTIONS: {
  value: ApiOrderStatus;
  label: string;
}[] = [
  { value: "aprobada", label: "Aprobada" },
  { value: "en_camino_recoger", label: "En camino a recoger" },
  { value: "vehiculo_recogido", label: "Vehículo recogido" },
  { value: "en_transito", label: "En Tránsito" },
  { value: "en_transito_puerto", label: "En tránsito al puerto" },
  { value: "entregado_puerto", label: "Entregado en puerto" },
];

const VALID_STATUSES = new Set<string>(
  ORDER_STATUS_OPTIONS.map((o) => o.value),
);

const API_STATUS_ALIASES: Record<string, VehicleStatus> = {
  aprobada: "aprobada",
  approved: "aprobada",
  active: "aprobada",
  publish: "aprobada",
  en_camino_recoger: "en_camino_recoger",
  vehiculo_recogido: "vehiculo_recogido",
  en_transito: "en_transito",
  in_transit: "en_transito",
  "en transito": "en_transito",
  en_transito_puerto: "en_transito_puerto",
  entregado_puerto: "entregado_puerto",
  entregada: "entregado_puerto",
  delivered: "entregado_puerto",
};

export function mapApiStatusToApp(status: unknown): VehicleStatus {
  const s = String(status).toLowerCase().trim();

  if (VALID_STATUSES.has(s)) return s as VehicleStatus;
  if (API_STATUS_ALIASES[s]) return API_STATUS_ALIASES[s];

  return "aprobada";
}

export function mapAppStatusToApi(status: VehicleStatus): ApiOrderStatus {
  return status;
}

export function getStatusDisplay(status: VehicleStatus | string) {
  const option = ORDER_STATUS_OPTIONS.find((o) => o.value === status);

  switch (status) {
    case "aprobada":
      return { text: option?.label ?? "Aprobada", color: "#15803D", bg: "#F0FDF4" };
    case "en_camino_recoger":
      return {
        text: option?.label ?? "En camino a recoger",
        color: "#1D4ED8",
        bg: "#EFF6FF",
      };
    case "vehiculo_recogido":
      return {
        text: option?.label ?? "Vehículo recogido",
        color: "#0E7490",
        bg: "#ECFEFF",
      };
    case "en_transito":
      return {
        text: option?.label ?? "En Tránsito",
        color: "#7E22CE",
        bg: "#F5F0FF",
      };
    case "en_transito_puerto":
      return {
        text: option?.label ?? "En tránsito al puerto",
        color: "#B45309",
        bg: "#FFF7ED",
      };
    case "entregado_puerto":
      return {
        text: option?.label ?? "Entregado en puerto",
        color: "#0F766E",
        bg: "#F0FDFA",
      };
    default:
      return { text: option?.label ?? String(status), color: "#555", bg: "#F3F4F6" };
  }
}

export function isActiveTransportStatus(status: VehicleStatus): boolean {
  return status !== "entregado_puerto";
}
