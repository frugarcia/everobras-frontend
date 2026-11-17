import {IconList, IconPlus, IconTrash} from "@tabler/icons-react";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import {AppInput} from "@/components/ui/app-input";
import {AppSelect} from "@/components/ui/app-select";
import {
  EMPTY_MACHINE_LINE,
  EMPTY_TRUCK_LINE,
  MEASURE_OPTIONS,
  type MachineLine,
  type TruckLine,
} from "./partLines";

function LineHeading({onAdd}: {onAdd: () => void}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <IconList size={20} className="text-muted-foreground" />
        <h3 className="text-lg font-semibold">Líneas</h3>
      </div>
      <ButtonBordered
        label="Añadir línea"
        color="blue-600"
        startContent={<IconPlus />}
        onPress={onAdd}
      />
    </div>
  );
}

export function TruckLines({
  lines,
  onChange,
}: {
  lines: TruckLine[];
  onChange: (lines: TruckLine[]) => void;
}) {
  const updateLine = (index: number, patch: Partial<TruckLine>) => {
    onChange(lines.map((line, i) => (i === index ? {...line, ...patch} : line)));
  };

  return (
    <div className="flex flex-col gap-3">
      <LineHeading onAdd={() => onChange([...lines, EMPTY_TRUCK_LINE])} />
      {lines.map((line, index) => (
        <div
          key={index}
          className="grid items-end gap-3 rounded-lg bg-muted p-3 sm:grid-cols-[1fr_1fr_8rem_9rem_auto]"
        >
          <AppInput
            label="Carga"
            className="bg-background"
            value={line.loadText}
            onChange={(e) => updateLine(index, {loadText: e.target.value})}
          />
          <AppInput
            label="Descarga"
            className="bg-background"
            value={line.unloadText}
            onChange={(e) => updateLine(index, {unloadText: e.target.value})}
          />
          <AppInput
            label="Total viaje/horas"
            type="number"
            min="0"
            step="0.01"
            className="bg-background"
            value={line.amount}
            onChange={(e) => updateLine(index, {amount: e.target.value})}
          />
          <AppSelect
            label="Unidad"
            options={MEASURE_OPTIONS}
            value={line.measure}
            triggerClassName="bg-background"
            onChange={(value) =>
              updateLine(index, {
                measure: value === "HORAS" ? "HORAS" : "VIAJES",
              })
            }
          />
          <div className="flex h-9 items-center justify-center">
            <ButtonTable
              tooltip="Eliminar línea"
              isDisabled={lines.length <= 1}
              icon={<IconTrash size={20} className="stroke-red-600" />}
              onClick={() => onChange(lines.filter((_, i) => i !== index))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MachineLines({
  lines,
  onChange,
}: {
  lines: MachineLine[];
  onChange: (lines: MachineLine[]) => void;
}) {
  const updateLine = (index: number, patch: Partial<MachineLine>) => {
    onChange(lines.map((line, i) => (i === index ? {...line, ...patch} : line)));
  };

  return (
    <div className="flex flex-col gap-3">
      <LineHeading onAdd={() => onChange([...lines, EMPTY_MACHINE_LINE])} />
      {lines.map((line, index) => (
        <div
          key={index}
          className="grid items-end gap-3 rounded-lg bg-muted p-3 sm:grid-cols-[8rem_8rem_8rem_1fr_auto]"
        >
          <AppInput
            label="Hora inicio"
            type="time"
            className="bg-background"
            value={line.startTime}
            onChange={(e) => updateLine(index, {startTime: e.target.value})}
          />
          <AppInput
            label="Hora fin"
            type="time"
            className="bg-background"
            value={line.endTime}
            onChange={(e) => updateLine(index, {endTime: e.target.value})}
          />
          <AppInput
            label="Total horas"
            type="number"
            min="0"
            step="0.01"
            className="bg-background"
            value={line.totalHours}
            onChange={(e) => updateLine(index, {totalHours: e.target.value})}
          />
          <AppInput
            label="Descripción del trabajo"
            className="bg-background"
            value={line.workDescription}
            onChange={(e) =>
              updateLine(index, {workDescription: e.target.value})
            }
          />
          <div className="flex h-9 items-center justify-center">
            <ButtonTable
              tooltip="Eliminar línea"
              isDisabled={lines.length <= 1}
              icon={<IconTrash size={20} className="stroke-red-600" />}
              onClick={() => onChange(lines.filter((_, i) => i !== index))}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
