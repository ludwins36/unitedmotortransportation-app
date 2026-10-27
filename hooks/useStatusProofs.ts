import { requestsService } from "@/services/requestsService";
import { StatusProof } from "@/types/statusProof";
import { ApiOrderStatus, mapApiStatusToApp } from "@/utils/orderStatus";
import { useCallback, useEffect, useState } from "react";

function mapProofItem(item: Record<string, unknown>): StatusProof | null {
  const imageUrl =
    (item.image_url as string) ||
    (item.imagen_url as string) ||
    (item.foto_url as string) ||
    (item.url as string);

  if (!imageUrl) return null;

  const rawStatus = item.status ?? item.estado;
  const status = mapApiStatusToApp(rawStatus) as ApiOrderStatus;

  return {
    id: String(item.id ?? item.ID ?? `${rawStatus}-${item.created_at}`),
    status,
    imageUrl,
    createdAt: String(
      item.created_at ?? item.date ?? item.fecha ?? new Date().toISOString(),
    ),
    userName:
      (item.user_name as string) ||
      (item.driver_name as string) ||
      (item.autor as string) ||
      undefined,
  };
}

export function useStatusProofs(requestId: string) {
  const [proofs, setProofs] = useState<StatusProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProofs = useCallback(async () => {
    if (!requestId) return;

    try {
      setIsLoading(true);
      const data = await requestsService.getStatusProofs(requestId);
      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray((data as { data?: unknown[] })?.data)
          ? (data as { data: Record<string, unknown>[] }).data
          : [];

      const mapped = rawItems
        .map((item) => mapProofItem(item as Record<string, unknown>))
        .filter((item): item is StatusProof => item !== null)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setProofs(mapped);
    } catch (error) {
      console.error("Error fetching status proofs:", error);
      setProofs([]);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  return { proofs, isLoading, refreshProofs: fetchProofs };
}
