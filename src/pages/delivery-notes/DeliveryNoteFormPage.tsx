import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {ArrowLeft, Plus, Trash2} from "lucide-react";
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

const UNIT_TYPES = [
  "TONELADAS",
  "M2",
  "M3",
  "PORTES",
  "HORAS",
  "VIAJES",
] as const;

interface Line {
  materialId: string | null;
  serviceId: string | null;
  unitType: string;
  quantity: number;
  price: number;
}

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
  const [lines, setLines] = useState<Line[]>([
    {
      materialId: null,
      serviceId: null,
      unitType: "HORAS",
      quantity: 1,
      price: 0,
    },
  ]);
  const [formReady, setFormReady] = useState(!isEdit);

  const {data: projects = []} = useProjects();
  const {data: workers = []} = useWorkers();
  const {data: materials = []} = useMaterials();
  const {data: services = []} = useServices();
  const {data: vehicles = []} = useVehicles();
  const {data: existingNote} = useDeliveryNote(id ?? "");

  const createMutation = useCreateDeliveryNote();
  const updateMutation = useUpdateDeliveryNote();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Populate form when editing
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
        lines: {
          materialId: string | null;
          serviceId: string | null;
          unitType: string;
          quantity: number;
          price: number;
        }[];
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

  const addLine = () => {
    setLines([
      ...lines,
      {
        materialId: null,
        serviceId: null,
        unitType: "HORAS",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: keyof Line,
    value: string | number | null,
  ) => {
    setLines(lines.map((line, i) =>
      i === index ? { ...line, [field]: value } : line
    ));
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
      vehicleText: isManualVehicle ? (vehicleText || null) : null,
      lines: lines.map((l) => ({
        materialId: l.materialId || null,
        serviceId: l.serviceId || null,
        unitType: l.unitType,
        quantity: Number(l.quantity),
        price: Number(l.price),
      })),
    };

    if (isEdit && id) {
      await updateMutation.mutateAsync({id, data: payload});
    } else {
      await createMutation.mutateAsync(payload);
    }
    navigate("/albaranes");
  };

  if (!formReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/albaranes")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Editar Albarán" : "Nuevo Albarán"}
          </h1>
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Albarán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNO">Interno</SelectItem>
                  <SelectItem value="EXTERNO">Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Nº Albarán Interno</Label>
              <Input
                value={internalNumber}
                onChange={(e) => setInternalNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Nº Albarán Externo</Label>
              <Input
                value={externalNumber}
                onChange={(e) => setExternalNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Obra</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar obra" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(
                    (p: {
                      id: string;
                      name: string;
                      customer?: {name: string};
                    }) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.customer?.name})
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Operario</Label>
              <Select value={workerId} onValueChange={setWorkerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar operario" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map(
                    (w: {id: string; firstName: string; lastName: string}) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.firstName} {w.lastName}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Firmado</Label>
              <Select value={signed} onValueChange={setSigned}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Vehículo</Label>
              <Select
                value={isManualVehicle ? "__manual__" : (vehicleId ?? "none")}
                onValueChange={(v) => {
                  if (v === "__manual__") {
                    setIsManualVehicle(true);
                    setVehicleId(null);
                  } else if (v === "none") {
                    setIsManualVehicle(false);
                    setVehicleId(null);
                    setVehicleText("");
                  } else {
                    setIsManualVehicle(false);
                    setVehicleId(v);
                    setVehicleText("");
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Sin vehículo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin vehículo</SelectItem>
                  {vehicles.map((v: { id: string; name: string; plate: string }) => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.plate})</SelectItem>
                  ))}
                  <SelectItem value="__manual__">✏️ Escribir manualmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isManualVehicle && (
              <div className="grid gap-2">
                <Label>Vehículo (manual)</Label>
                <Input
                  value={vehicleText}
                  onChange={(e) => setVehicleText(e.target.value)}
                  placeholder="Escribir nombre del vehículo"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Líneas</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLine}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Añadir línea
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lines.map((line, i) => (
            <div
              key={i}
              className="grid gap-3 sm:grid-cols-6 items-end p-3 rounded-lg border bg-muted/30"
            >
              <div className="sm:col-span-2 grid gap-2">
                <Label className="text-xs">Material</Label>
                <Select
                  value={line.materialId ?? "none"}
                  onValueChange={(v) =>
                    updateLine(i, "materialId", v === "none" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {materials.map((m: {id: string; name: string}) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Servicio</Label>
                <Select
                  value={line.serviceId ?? "none"}
                  onValueChange={(v) =>
                    updateLine(i, "serviceId", v === "none" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {services.map((s: {id: string; name: string}) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Tipo Unidad</Label>
                <Select
                  value={line.unitType}
                  onValueChange={(v) => updateLine(i, "unitType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Cantidad</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(i, "quantity", parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 grid gap-2">
                  <Label className="text-xs">Precio (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.price}
                    onChange={(e) =>
                      updateLine(i, "price", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                {lines.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(i)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/albaranes")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !projectId || !workerId}>
          {isPending ? "Guardando..." : isEdit ? "Actualizar" : "Crear Albarán"}
        </Button>
      </div>
    </form>
  );
}
