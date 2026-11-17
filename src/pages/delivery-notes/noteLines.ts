export const UNIT_TYPES = [
  "TONELADAS",
  "M2",
  "M3",
  "PORTES",
  "HORAS",
  "VIAJES",
] as const;

export const UNIT_TYPE_OPTIONS = UNIT_TYPES.map((unit) => ({
  value: unit,
  label: unit,
}));

export interface NoteLine {
  materialId: string | null;
  serviceId: string | null;
  unitType: string;
  quantity: number;
  price: number;
}

export const EMPTY_NOTE_LINE: NoteLine = {
  materialId: null,
  serviceId: null,
  unitType: "HORAS",
  quantity: 1,
  price: 0,
};

export function toPayloadLines(lines: NoteLine[]) {
  return lines.map((line) => ({
    materialId: line.materialId || null,
    serviceId: line.serviceId || null,
    unitType: line.unitType,
    quantity: Number(line.quantity),
    price: Number(line.price),
  }));
}
