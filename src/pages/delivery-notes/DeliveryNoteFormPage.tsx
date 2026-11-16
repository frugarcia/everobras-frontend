import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
  IconCancel,
  IconCirclePlus,
  IconDeviceFloppy,
  IconEdit,
  IconList,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import GoBackTitle from "@/components/GoBackTitle";
import Loader from "@/components/Loader";
import {AppInput} from "@/components/ui/app-input";
import {AppSelect} from "@/components/ui/app-select";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {
  useProjects,
  useWorkers,
  useMaterials,
  useServices,
  useVehicles,
  useDeliveryNote,
  useCreateDeliveryNote,
  useUpdateDeliveryNote,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";

const UNIT_TYPES = [
  "TONELADAS",
  "M2",
  "M3",
  "PORTES",
  "HORAS",
  "VIAJES",
] as const;

const TYPE_OPTIONS = [
  {value: "INTERNO", label: "Interno"},
  {value: "EXTERNO", label: "Externo"},
];

const SIGNED_OPTIONS = [
  {value: "true", label: "Sí"},
  {value: "false", label: "No"},
];

const UNIT_TYPE_OPTIONS = UNIT_TYPES.map((u) => ({value: u, label: u}));

interface Line {
  materialId: string | null;
  serviceId: string | null;
  unitType: string;
  quantity: number;
  price: number;
}

const EMPTY_LINE: Line = {
  materialId: null,
  serviceId: null,
  unitType: "HORAS",
  quantity: 1,
  price: 0,
};

export default function DeliveryNoteFormPage() {
  const {id} = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [type, setType] = useState("INTERNO");
  const [internalNumber, setInternalNumber] = useState("");
  const [externalNumber, setExternalNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [signed, setSigned] = useState("false");
  const [projectId, setProjectId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicleText, setVehicleText] = useState("");
  const [isManualVehicle, setIsManualVehicle] = useState(false);
  const [lines, setLines] = useState<Line[]>([EMPTY_LINE]);
  const [formReady, setFormReady] = useState(!isEdit);

  const {data: projectsResult} = useProjects({limit: 9999});
  const {data: workersResult} = useWorkers({limit: 9999});
  const {data: materialsResult} = useMaterials({limit: 9999});
  const {data: servicesResult} = useServices({limit: 9999});
  const {data: vehiclesResult} = useVehicles({limit: 9999});
  const {data: existingNote} = useDeliveryNote(id ?? "");

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
  const materialOptions = [
    {value: "none", label: "Ninguno"},
    ...(materialsResult?.data ?? []).map((m: {id: string; name: string}) => ({
      value: m.id,
      label: m.name,
    })),
  ];
  const serviceOptions = [
    {value: "none", label: "Ninguno"},
    ...(servicesResult?.data ?? []).map((s: {id: string; name: string}) => ({
      value: s.id,
      label: s.name,
    })),
  ];

  const createMutation = useCreateDeliveryNote();
  const updateMutation = useUpdateDeliveryNote();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Rellenar el formulario al editar
  useEffect(() => {
    if (isEdit && existingNote) {
      const note = existingNote as {
        type: string;
        internalNumber: string;
        externalNumber: string;
        date: string;
        signed: boolean;
        projectId: string;
        workerId: string;
        vehicleId: string | null;
        vehicleText: string | null;
        lines: Line[];
      };
      setType(note.type);
      setInternalNumber(note.internalNumber ?? "");
      setExternalNumber(note.externalNumber ?? "");
      setDate(note.date.split("T")[0]);
      setSigned(note.signed ? "true" : "false");
      setProjectId(note.projectId);
      setWorkerId(note.workerId);
      if (note.vehicleId) {
        setVehicleId(note.vehicleId);
        setIsManualVehicle(false);
      } else if (note.vehicleText) {
        setVehicleText(note.vehicleText);
        setIsManualVehicle(true);
      }
      setLines(
        note.lines.map((l) => ({
          materialId: l.materialId,
          serviceId: l.serviceId,
          unitType: l.unitType,
          quantity: l.quantity,
          price: l.price,
        })),
      );
      setFormReady(true);
    }
  }, [isEdit, existingNote]);

  const addLine = () => setLines([...lines, EMPTY_LINE]);

  const removeLine = (index: number) =>
    setLines(lines.filter((_, i) => i !== index));

  const updateLine = (
    index: number,
    field: keyof Line,
    value: string | number | null,
  ) => {
    setLines(
      lines.map((line, i) => (i === index ? {...line, [field]: value} : line)),
    );
  };

  const handleVehicleChange = (v: string) => {
    if (v === "__manual__") {
      setIsManualVehicle(true);
      setVehicleId(null);
    } else if (v === "none" || !v) {
      setIsManualVehicle(false);
      setVehicleId(null);
      setVehicleText("");
    } else {
      setIsManualVehicle(false);
      setVehicleId(v);
      setVehicleText("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type,
      internalNumber: internalNumber || null,
      externalNumber: externalNumber || null,
      date,
      signed: signed === "true",
      projectId,
      workerId,
      vehicleId: !isManualVehicle ? vehicleId : null,
      vehicleText: isManualVehicle ? vehicleText || null : null,
      lines: lines.map((l) => ({
        materialId: l.materialId || null,
        serviceId: l.serviceId || null,
        unitType: l.unitType,
        quantity: Number(l.quantity),
        price: Number(l.price),
      })),
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({id, data: payload});
        toast.success("Albarán actualizado correctamente");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Albarán creado correctamente");
      }
      navigate("/albaranes");
    } catch (err) {
      toast.error(getErrorMessage(err, "Error al guardar el albarán"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GoBackTitle
        icon={isEdit ? <IconEdit /> : <IconCirclePlus />}
        title={isEdit ? "Editar albarán" : "Añadir nuevo albarán"}
      />

      {!formReady ? (
        <Loader />
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <Card className="p-4">
            <CardContent className="flex flex-col gap-6">
              {/* Cabecera */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AppSelect
                  label="Tipo"
                  isRequired
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={(v) => setType(v || "INTERNO")}
                />
                <AppInput
                  label="Nº albarán interno"
                  value={internalNumber}
                  onChange={(e) => setInternalNumber(e.target.value)}
                />
                <AppInput
                  label="Nº albarán externo"
                  value={externalNumber}
                  onChange={(e) => setExternalNumber(e.target.value)}
                />
                <AppInput
                  label="Fecha"
                  type="date"
                  isRequired
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <AppSelect
                  label="Obra"
                  isRequired
                  placeholder="Seleccionar obra"
                  options={projectOptions}
                  value={projectId}
                  onChange={setProjectId}
                />
                <AppSelect
                  label="Operario"
                  isRequired
                  placeholder="Seleccionar operario"
                  options={workerOptions}
                  value={workerId}
                  onChange={setWorkerId}
                />
                <AppSelect
                  label="Firmado"
                  options={SIGNED_OPTIONS}
                  value={signed}
                  onChange={(v) => setSigned(v || "false")}
                />
                <AppSelect
                  label="Vehículo"
                  options={vehicleOptions}
                  value={
                    isManualVehicle ? "__manual__" : (vehicleId ?? "none")
                  }
                  onChange={handleVehicleChange}
                />
                {isManualVehicle && (
                  <AppInput
                    label="Vehículo (manual)"
                    placeholder="Escribir nombre del vehículo"
                    value={vehicleText}
                    onChange={(e) => setVehicleText(e.target.value)}
                  />
                )}
              </div>

              {/* Líneas */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconList size={20} className="text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Líneas</h3>
                  </div>
                  <ButtonBordered
                    label="Añadir línea"
                    color="blue-600"
                    startContent={<IconPlus />}
                    onPress={addLine}
                  />
                </div>
                {lines.map((line, i) => (
                  <div
                    key={i}
                    className="grid items-end gap-3 rounded-lg bg-muted p-3 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto]"
                  >
                    <AppSelect
                      label="Material"
                      options={materialOptions}
                      value={line.materialId ?? "none"}
                      onChange={(v) =>
                        updateLine(
                          i,
                          "materialId",
                          v === "none" || !v ? null : v,
                        )
                      }
                      triggerClassName="bg-background"
                    />
                    <AppSelect
                      label="Servicio"
                      options={serviceOptions}
                      value={line.serviceId ?? "none"}
                      onChange={(v) =>
                        updateLine(
                          i,
                          "serviceId",
                          v === "none" || !v ? null : v,
                        )
                      }
                      triggerClassName="bg-background"
                    />
                    <AppSelect
                      label="Tipo unidad"
                      options={UNIT_TYPE_OPTIONS}
                      value={line.unitType}
                      onChange={(v) => updateLine(i, "unitType", v || "HORAS")}
                      triggerClassName="bg-background"
                    />
                    <AppInput
                      label="Cantidad"
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-background"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(
                          i,
                          "quantity",
                          parseFloat(e.target.value) || 0,
                        )
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
                        icon={
                          <IconTrash size={20} className="stroke-red-600" />
                        }
                        onClick={() => removeLine(i)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full justify-end gap-4">
                <ButtonBordered
                  label="Cancelar"
                  color="red-600"
                  startContent={<IconCancel />}
                  onPress={() => navigate("/albaranes")}
                  isDisabled={isPending}
                />
                <ButtonBordered
                  label={isEdit ? "Guardar cambios" : "Crear albarán"}
                  color="green-600"
                  type="submit"
                  startContent={<IconDeviceFloppy />}
                  isLoading={isPending}
                  isDisabled={isPending || !projectId || !workerId}
                />
              </div>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
