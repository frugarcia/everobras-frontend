import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {IconCancel, IconCirclePlus, IconDeviceFloppy, IconEdit} from "@tabler/icons-react";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import GoBackTitle from "@/components/GoBackTitle";
import Loader from "@/components/Loader";
import {AppCombobox} from "@/components/ui/app-combobox";
import {AppInput} from "@/components/ui/app-input";
import {AppSelect} from "@/components/ui/app-select";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {
  useCreateInternalPart,
  useInternalPart,
  useProjects,
  useUpdateInternalPart,
  useVehicles,
  useWorkers,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {ProjectForm} from "@/pages/maintenance/ProjectsPage";
import {VehicleForm} from "@/pages/maintenance/VehiclesPage";
import {WorkerForm} from "@/pages/maintenance/WorkersPage";
import {MachineLines, TruckLines} from "./InternalPartLines";
import {
  EMPTY_MACHINE_LINE,
  EMPTY_TRUCK_LINE,
  TYPE_OPTIONS,
  parseAmount,
  type MachineLine,
  type PartType,
  type TruckLine,
} from "./partLines";

export default function InternalPartFormPage() {
  const {id} = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [type, setType] = useState<PartType | "">("");
  const [number, setNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicleText, setVehicleText] = useState("");
  const [isManualVehicle, setIsManualVehicle] = useState(false);
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [dieselLiters, setDieselLiters] = useState("");
  const [workedHours, setWorkedHours] = useState("");
  const [machineHours, setMachineHours] = useState("");
  const [truckLines, setTruckLines] = useState<TruckLine[]>([EMPTY_TRUCK_LINE]);
  const [machineLines, setMachineLines] = useState<MachineLine[]>([
    EMPTY_MACHINE_LINE,
  ]);
  const [formReady, setFormReady] = useState(!isEdit);

  const {data: projectsResult} = useProjects({limit: 9999});
  const {data: workersResult} = useWorkers({limit: 9999});
  const {data: vehiclesResult} = useVehicles({limit: 9999});
  const {data: existingPart} = useInternalPart(id ?? "");

  const projectOptions = (projectsResult?.data ?? []).map(
    (p: {id: string; name: string; customer?: {name: string}}) => ({
      value: p.id,
      label: `${p.name} (${p.customer?.name})`,
    }),
  );
  const workerOptions = (workersResult?.data ?? []).map(
    (w: {id: string; firstName: string; lastName: string}) => ({
      value: w.id,
      label: `${w.firstName} ${w.lastName}`,
    }),
  );
  const vehicleOptions = [
    {value: "none", label: "Sin vehículo"},
    ...(vehiclesResult?.data ?? []).map(
      (v: {id: string; name: string; plate: string}) => ({
        value: v.id,
        label: `${v.name} (${v.plate})`,
      }),
    ),
    {value: "__manual__", label: "Escribir manualmente"},
  ];

  const createMutation = useCreateInternalPart();
  const updateMutation = useUpdateInternalPart();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isEdit || !existingPart) return;
    const part = existingPart as {
      type: PartType;
      number: string | null;
      date: string;
      projectId: string;
      workerId: string;
      vehicleId: string | null;
      vehicleText: string | null;
      startKm: number | null;
      endKm: number | null;
      dieselLiters: number | null;
      workedHours: number | null;
      machineHours: number | null;
      lines: {
        loadText: string | null;
        unloadText: string | null;
        amount: number | null;
        measure: "VIAJES" | "HORAS" | null;
        startTime: string | null;
        endTime: string | null;
        totalHours: number | null;
        workDescription: string | null;
      }[];
    };
    setType(part.type);
    setNumber(part.number ?? "");
    setDate(part.date.split("T")[0]);
    setProjectId(part.projectId);
    setWorkerId(part.workerId);
    if (part.vehicleId) {
      setVehicleId(part.vehicleId);
      setIsManualVehicle(false);
    } else if (part.vehicleText) {
      setVehicleText(part.vehicleText);
      setIsManualVehicle(true);
    }
    if (part.type === "CAMIONES") {
      setStartKm(part.startKm == null ? "" : String(part.startKm));
      setEndKm(part.endKm == null ? "" : String(part.endKm));
      setDieselLiters(part.dieselLiters == null ? "" : String(part.dieselLiters));
      setTruckLines(
        part.lines.map((line) => ({
          loadText: line.loadText ?? "",
          unloadText: line.unloadText ?? "",
          amount: line.amount == null ? "" : String(line.amount),
          measure: line.measure ?? "VIAJES",
        })),
      );
    } else {
      setWorkedHours(part.workedHours == null ? "" : String(part.workedHours));
      setMachineHours(part.machineHours == null ? "" : String(part.machineHours));
      setMachineLines(
        part.lines.map((line) => ({
          startTime: line.startTime ?? "",
          endTime: line.endTime ?? "",
          totalHours: line.totalHours == null ? "" : String(line.totalHours),
          workDescription: line.workDescription ?? "",
        })),
      );
    }
    setFormReady(true);
  }, [isEdit, existingPart]);

  const handleVehicleChange = (value: string) => {
    if (value === "__manual__") {
      setIsManualVehicle(true);
      setVehicleId(null);
    } else if (value === "none" || !value) {
      setIsManualVehicle(false);
      setVehicleId(null);
      setVehicleText("");
    } else {
      setIsManualVehicle(false);
      setVehicleId(value);
      setVehicleText("");
    }
  };

  const handleTypeChange = (value: string) => {
    if (value !== "MAQUINARIA" && value !== "CAMIONES") return;
    if (value === type) return;
    setType(value);
    if (value === "MAQUINARIA") {
      setMachineLines([EMPTY_MACHINE_LINE]);
      setStartKm("");
      setEndKm("");
      setDieselLiters("");
    } else {
      setTruckLines([EMPTY_TRUCK_LINE]);
      setWorkedHours("");
      setMachineHours("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type !== "MAQUINARIA" && type !== "CAMIONES") {
      toast.error("Selecciona si el parte es de maquinaria o de camiones");
      return;
    }

    const vehicle = {
      vehicleId: !isManualVehicle ? vehicleId : null,
      vehicleText: isManualVehicle ? vehicleText.trim() || null : null,
    };
    const common = {
      type,
      number: number.trim() || null,
      date,
      projectId,
      workerId,
      ...vehicle,
    };

    let payload: Record<string, unknown>;
    if (type === "CAMIONES") {
      const start = parseAmount(startKm);
      const end = parseAmount(endKm);
      const liters = parseAmount(dieselLiters);
      if (start == null || end == null || liters == null) {
        toast.error("Indica los km de inicio, los km finales y los litros de gasoil");
        return;
      }
      if (end < start) {
        toast.error("Los km finales no pueden ser menores que los iniciales");
        return;
      }
      const lines = truckLines.map((line) => ({
        loadText: line.loadText.trim() || null,
        unloadText: line.unloadText.trim() || null,
        amount: parseAmount(line.amount),
        measure: line.measure,
      }));
      if (lines.some((line) => line.amount == null)) {
        toast.error("Cada línea necesita un total de viajes u horas");
        return;
      }
      payload = { ...common, startKm: start, endKm: end, dieselLiters: liters, lines };
    } else {
      const worked = parseAmount(workedHours);
      const machine = parseAmount(machineHours);
      if (worked == null || machine == null) {
        toast.error("Indica el total de horas trabajadas y el total de horas de máquina");
        return;
      }
      const lines = machineLines.map((line) => ({
        startTime: line.startTime,
        endTime: line.endTime,
        totalHours: parseAmount(line.totalHours),
        workDescription: line.workDescription.trim() || null,
      }));
      if (
        lines.some(
          (line) => !line.startTime || !line.endTime || line.totalHours == null,
        )
      ) {
        toast.error("Cada línea necesita hora de inicio, hora de fin y el total de horas");
        return;
      }
      payload = { ...common, workedHours: worked, machineHours: machine, lines };
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({id, data: payload});
        toast.success("Parte interno actualizado correctamente");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Parte interno creado correctamente");
      }
      navigate("/partes-internos");
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al guardar el parte interno"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GoBackTitle
        icon={isEdit ? <IconEdit /> : <IconCirclePlus />}
        title={isEdit ? "Editar parte interno" : "Añadir nuevo parte interno"}
      />

      {!formReady ? (
        <Loader />
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <Card className="p-4">
            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AppSelect
                  label="Tipo"
                  isRequired
                  placeholder="Seleccionar tipo"
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={handleTypeChange}
                />
                <AppInput
                  label="Nº parte"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
                <AppInput
                  label="Fecha"
                  type="date"
                  isRequired
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <AppCombobox
                  label="Obra"
                  isRequired
                  placeholder="Seleccionar obra"
                  options={projectOptions}
                  value={projectId}
                  onChange={setProjectId}
                  createLabel="Añadir nueva obra"
                  renderCreateForm={(close) => (
                    <ProjectForm
                      item={null}
                      onClose={close}
                      onCreated={setProjectId}
                    />
                  )}
                />
                <AppCombobox
                  label="Operario"
                  isRequired
                  placeholder="Seleccionar operario"
                  options={workerOptions}
                  value={workerId}
                  onChange={setWorkerId}
                  createLabel="Añadir nuevo operario"
                  renderCreateForm={(close) => (
                    <WorkerForm
                      item={null}
                      onClose={close}
                      onCreated={setWorkerId}
                    />
                  )}
                />
                <AppCombobox
                  label="Vehículo"
                  options={vehicleOptions}
                  value={isManualVehicle ? "__manual__" : (vehicleId ?? "none")}
                  onChange={handleVehicleChange}
                  createLabel="Añadir nuevo vehículo"
                  renderCreateForm={(close) => (
                    <VehicleForm
                      item={null}
                      onClose={close}
                      onCreated={handleVehicleChange}
                    />
                  )}
                />
                {isManualVehicle ? (
                  <AppInput
                    label="Vehículo (manual)"
                    placeholder="Escribir nombre del vehículo"
                    value={vehicleText}
                    onChange={(e) => setVehicleText(e.target.value)}
                  />
                ) : null}
                {type === "CAMIONES" ? (
                  <>
                    <AppInput
                      label="Kms inicio"
                      type="number"
                      min="0"
                      step="0.01"
                      isRequired
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value)}
                    />
                    <AppInput
                      label="Kms final"
                      type="number"
                      min="0"
                      step="0.01"
                      isRequired
                      value={endKm}
                      onChange={(e) => setEndKm(e.target.value)}
                    />
                    <AppInput
                      label="Litros gasoil"
                      type="number"
                      min="0"
                      step="0.01"
                      isRequired
                      value={dieselLiters}
                      onChange={(e) => setDieselLiters(e.target.value)}
                    />
                  </>
                ) : null}
              </div>

              {type === "CAMIONES" ? (
                <TruckLines lines={truckLines} onChange={setTruckLines} />
              ) : null}
              {type === "MAQUINARIA" ? (
                <MachineLines lines={machineLines} onChange={setMachineLines} />
              ) : null}
              {type === "" ? (
                <p className="text-sm text-muted-foreground">
                  Selecciona si el parte es de maquinaria o de camiones para ver sus líneas.
                </p>
              ) : null}

              {type === "MAQUINARIA" ? (
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-semibold">Pie</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AppInput
                      label="Total horas trabajadas"
                      type="number"
                      min="0"
                      step="0.01"
                      isRequired
                      value={workedHours}
                      onChange={(e) => setWorkedHours(e.target.value)}
                    />
                    <AppInput
                      label="Total horas máquina"
                      type="number"
                      min="0"
                      step="0.01"
                      isRequired
                      value={machineHours}
                      onChange={(e) => setMachineHours(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
            </CardContent>
            <CardFooter>
              <div className="flex w-full justify-end gap-4">
                <ButtonBordered
                  label="Cancelar"
                  color="red-600"
                  startContent={<IconCancel />}
                  onPress={() => navigate("/partes-internos")}
                  isDisabled={isPending}
                />
                <ButtonBordered
                  label={isEdit ? "Guardar cambios" : "Crear parte"}
                  color="green-600"
                  type="submit"
                  startContent={<IconDeviceFloppy />}
                  isLoading={isPending}
                  isDisabled={isPending || !type || !projectId || !workerId}
                />
              </div>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
