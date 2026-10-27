/**
 * Formatea un valor numérico como moneda de Honduras (Lempiras - HNL).
 * Símbolo: L | Formato: L 1,234.56
 */
export function formatPriceHNL(
  price: number | string | undefined | null
): string {
  if (price === undefined || price === null || price === "") return "";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(num)) return "";
  const [intPart, decPart] = num.toFixed(2).split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `L ${withCommas}.${decPart}`;
}
