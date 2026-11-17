import {IconList, IconPlus, IconTrash} from "@tabler/icons-react";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import {AppInput} from "@/components/ui/app-input";
import {AppSelect} from "@/components/ui/app-select";
import {UNIT_TYPE_OPTIONS} from "@/pages/delivery-notes/noteLines";
import {
  EMPTY_PROFORMA_LINE,
  formatEuros,
  lineAmount,
  parseAmount,
  type ProformaLineDraft,
} from "./money";

export default function ProformaLines({
  lines,
  onChange,
}: {
  lines: ProformaLineDraft[];
  onChange: (lines: ProformaLineDraft[]) => void;
}) {
  const updateLine = (index: number, patch: Partial<ProformaLineDraft>) => {
    onChange(lines.map((line, i) => (i === index ? {...line, ...patch} : line)));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconList size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold">Partidas</h3>
        </div>
        <ButtonBordered
          label="Añadir línea"
          color="blue-600"
          startContent={<IconPlus />}
          onPress={() => onChange([...lines, EMPTY_PROFORMA_LINE])}
        />
      </div>
      {lines.map((line, index) => {
        const quantity = parseAmount(line.quantity);
        const price = parseAmount(line.unitPrice);
        const amount =
          quantity == null || price == null ? null : lineAmount(quantity, price);
        return (
          <div
            key={index}
            className="grid items-end gap-3 rounded-lg bg-muted p-3 lg:grid-cols-[8rem_1fr_9rem_6rem_6rem_7rem_auto]"
          >
            <AppInput
              label="Nº partida"
              className="bg-background"
              value={line.partNumbers}
              onChange={(e) => updateLine(index, {partNumbers: e.target.value})}
            />
            <AppInput
              label="Partida"
              className="bg-background"
              value={line.description}
              onChange={(e) => updateLine(index, {description: e.target.value})}
            />
            <AppSelect
              label="Ud"
              options={
                UNIT_TYPE_OPTIONS.some((option) => option.value === line.unit)
                  ? UNIT_TYPE_OPTIONS
                  : [{value: line.unit, label: line.unit}, ...UNIT_TYPE_OPTIONS]
              }
              value={line.unit}
              triggerClassName="bg-background"
              onChange={(value) => updateLine(index, {unit: value || "HORAS"})}
            />
            <AppInput
              label="Medición"
              type="number"
              min="0"
              step="0.01"
              className="bg-background"
              value={line.quantity}
              onChange={(e) => updateLine(index, {quantity: e.target.value})}
            />
            <AppInput
              label="Precio unit."
              type="number"
              min="0"
              step="0.0001"
              className="bg-background"
              value={line.unitPrice}
              onChange={(e) => updateLine(index, {unitPrice: e.target.value})}
            />
            <div className="flex h-9 items-center text-sm font-medium">
              {amount == null ? "—" : formatEuros(amount)}
            </div>
            <div className="flex h-9 items-center justify-center">
              <ButtonTable
                tooltip="Eliminar línea"
                isDisabled={lines.length <= 1}
                icon={<IconTrash size={20} className="stroke-red-600" />}
                onClick={() => onChange(lines.filter((_, i) => i !== index))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
