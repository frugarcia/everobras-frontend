export type PartType = "MAQUINARIA" | "CAMIONES";
export type PartMeasure = "VIAJES" | "HORAS";

export type TruckLine = {
  loadText: string;
  unloadText: string;
  amount: string;
  measure: PartMeasure;
};

export type MachineLine = {
  startTime: string;
  endTime: string;
  totalHours: string;
  workDescription: string;
};

export const TYPE_OPTIONS = [
  {value: "MAQUINARIA", label: "Maquinaria"},
  {value: "CAMIONES", label: "Camiones"},
];

export const MEASURE_OPTIONS = [
  {value: "VIAJES", label: "Viajes"},
  {value: "HORAS", label: "Horas"},
];

export const TYPE_LABEL: Record<PartType, string> = {
  MAQUINARIA: "Maquinaria",
  CAMIONES: "Camiones",
};

export const MEASURE_LABEL: Record<PartMeasure, string> = {
  VIAJES: "Viajes",
  HORAS: "Horas",
};

export const EMPTY_TRUCK_LINE: TruckLine = {
  loadText: "",
  unloadText: "",
  amount: "",
  measure: "VIAJES",
};

export const EMPTY_MACHINE_LINE: MachineLine = {
  startTime: "",
  endTime: "",
  totalHours: "",
  workDescription: "",
};

export function parseAmount(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

export function formatQuantity(value: number) {
  return new Intl.NumberFormat("es-ES", {maximumFractionDigits: 2}).format(
    value,
  );
}
