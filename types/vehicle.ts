export type VehicleStatus =
  | "aprobada"
  | "en_camino_recoger"
  | "vehiculo_recogido"
  | "en_transito"
  | "en_transito_puerto"
  | "entregado_puerto";

export interface Vehicle {
  id: string;
  vin: string;
  subasta: string;
  estadoSubasta: string;
  comprador: string;
  pais: string;
  date: string;
  status: VehicleStatus;
  price?: number;
  foto_url?: string;
  factura_url?: string;
  title?: string;
}
