import {IconList, IconPlus, IconTrash} from "@tabler/icons-react";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import {AppCombobox} from "@/components/ui/app-combobox";
import {AppInput} from "@/components/ui/app-input";
import {MaterialForm} from "@/pages/maintenance/MaterialsPage";
import {ServiceForm} from "@/pages/maintenance/ServicesPage";
import type {TOption} from "@/components/ui/app-select";
import {
  EMPTY_NOTE_LINE,
  UNIT_TYPE_OPTIONS,
  type NoteLine,
} from "./noteLines";

export default function DeliveryNoteLines({
  title = "Líneas",
  lines,
  materialOptions,
  serviceOptions,
  onChange,
}: {
  title?: string;
  lines: NoteLine[];
  materialOptions: TOption[];
  serviceOptions: TOption[];
  onChange: (lines: NoteLine[]) => void;
}) {
  const updateLine = (
    index: number,
    field: keyof NoteLine,
    value: string | number | null,
  ) => {
    onChange(
      lines.map((line, i) => (i === index ? {...line, [field]: value} : line)),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconList size={20} className="text-muted-foreground" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <ButtonBordered
          label="Añadir línea"
          color="blue-600"
          startContent={<IconPlus />}
          onPress={() => onChange([...lines, EMPTY_NOTE_LINE])}
        />
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          className="grid items-end gap-3 rounded-lg bg-muted p-3 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto]"
        >
          <AppCombobox
            label="Material"
            options={materialOptions}
            value={line.materialId ?? "none"}
            onChange={(v) =>
              updateLine(i, "materialId", v === "none" || !v ? null : v)
            }
            inputClassName="bg-background"
            createLabel="Añadir nuevo material"
            renderCreateForm={(close) => (
              <MaterialForm
                item={null}
                onClose={close}
                onCreated={(id) => updateLine(i, "materialId", id)}
              />
            )}
          />
          <AppCombobox
            label="Servicio"
            options={serviceOptions}
            value={line.serviceId ?? "none"}
            onChange={(v) =>
              updateLine(i, "serviceId", v === "none" || !v ? null : v)
            }
            inputClassName="bg-background"
            createLabel="Añadir nuevo servicio"
            renderCreateForm={(close) => (
              <ServiceForm
                item={null}
                onClose={close}
                onCreated={(id) => updateLine(i, "serviceId", id)}
              />
            )}
          />
          <AppCombobox
            label="Tipo unidad"
            options={UNIT_TYPE_OPTIONS}
            value={line.unitType}
            onChange={(v) => updateLine(i, "unitType", v || "HORAS")}
            inputClassName="bg-background"
          />
          <AppInput
            label="Cantidad"
            type="number"
            min="0"
            step="0.01"
            className="bg-background"
            value={line.quantity}
            onChange={(e) =>
              updateLine(i, "quantity", parseFloat(e.target.value) || 0)
            }
          />
          <AppInput
            label="Precio (€)"
            type="number"
            min="0"
            step="0.01"
            className="bg-background"
            value={line.price}
            onChange={(e) =>
              updateLine(i, "price", parseFloat(e.target.value) || 0)
            }
          />
          <div className="flex h-9 items-center justify-center">
            <ButtonTable
              tooltip="Eliminar línea"
              isDisabled={lines.length <= 1}
              icon={<IconTrash size={20} className="stroke-red-600" />}
              onClick={() => onChange(lines.filter((_, index) => index !== i))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
