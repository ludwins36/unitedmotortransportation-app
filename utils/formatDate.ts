export function formatDateTime(dateStr: string): string {
  if (!dateStr) return "—";

  try {
    return new Date(dateStr).toLocaleString("es-HN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
