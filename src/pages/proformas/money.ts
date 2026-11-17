export const VAT_RATE = 0.21;

export type ProformaLineDraft = {
  partNumbers: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  deliveryNoteIds: string[];
};

export const EMPTY_PROFORMA_LINE: ProformaLineDraft = {
  partNumbers: "",
  description: "",
  unit: "HORAS",
  quantity: "",
  unitPrice: "",
  deliveryNoteIds: [],
};

export function localISODate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatDay(value: string) {
  const [year, month, day] = value.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

export function parseAmount(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineAmount(quantity: number, unitPrice: number) {
  return roundMoney(quantity * unitPrice);
}

export function proformaTotals(
  lines: {quantity: number; unitPrice: number}[],
  vatRate = VAT_RATE,
) {
  const base = roundMoney(
    lines.reduce((sum, line) => sum + lineAmount(line.quantity, line.unitPrice), 0),
  );
  const vat = roundMoney(base * vatRate);
  const total = roundMoney(base + vat);
  return {base, vat, total};
}

export function formatEuros(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}
