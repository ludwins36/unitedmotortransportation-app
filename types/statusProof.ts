import { ApiOrderStatus } from "@/utils/orderStatus";

export interface StatusProof {
  id: string;
  status: ApiOrderStatus;
  imageUrl: string;
  createdAt: string;
  userName?: string;
}
