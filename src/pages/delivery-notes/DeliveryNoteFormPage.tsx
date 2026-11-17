import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
  IconCancel,
  IconCirclePlus,
  IconDeviceFloppy,
  IconEdit,
  IconFileInvoice,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import GoBackTitle from "@/components/GoBackTitle";
import Loader from "@/components/Loader";
import {AppCombobox} from "@/components/ui/app-combobox";
import {AppInput, AppTextarea} from "@/components/ui/app-input";
import {AppSelect} from "@/components/ui/app-select";
import {ProjectForm} from "@/pages/maintenance/ProjectsPage";
import {WorkerForm} from "@/pages/maintenance/WorkersPage";
import {VehicleForm} from "@/pages/maintenance/VehiclesPage";
import {SupplierForm} from "@/pages/maintenance/SuppliersPage";
import {AttachmentField} from "@/components/AttachmentField";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {
  useProjects,
  useWorkers,
  useMaterials,
  useServices,
  useVehicles,
  useSuppliers,
  useDeliveryNote,
  useCreateDeliveryNote,
  useUpdateDeliveryNote,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import DeliveryNoteLines from "./DeliveryNoteLines";
import {
  EMPTY_NOTE_LINE,
  toPayloadLines,
  type NoteLine,
} from "./noteLines";

const SIGNED_OPTIONS = [
  {value: "true", label: "Sí"},
  {value: "false", label: "No"},
];

interface PurchaseNote {
  supplierId: string;
  number: string;
  date: string;
  attachmentKey: string | null;
  attachmentName: string | null;
  lines: NoteLine[];
}

function emptyPurchaseNote(): PurchaseNote {
  return {
    supplierId: "",
    number: "",
    date: new Date().toISOString().split("T")[0],
    attachmentKey: null,
    attachmentName: null,
    lines: [EMPTY_NOTE_LINE],
  };
}

export default function DeliveryNoteFormPage() {
  const {id} = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [number, setNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [signed, setSigned] = useState("false");
  const [projectId, setProjectId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicleText, setVehicleText] = useState("");
  const [observations, setObservations] = useState("");
  const [attachmentKey, setAttachmentKey] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [isManualVehicle, setIsManualVehicle] = useState(false);
  const [lines, setLines] = useState<NoteLine[]>([EMPTY_NOTE_LINE]);
  const [purchaseNotes, setPurchaseNotes] = useState<PurchaseNote[]>([]);
  const [formReady, setFormReady] = useState(!isEdit);

  const {data: projectsResult} = useProjects({limit: 9999});
  const {data: workersResult} = useWorkers({limit: 9999});
  const {data: materialsResult} = useMaterials({limit: 9999});
  const {data: servicesResult} = useServices({limit: 9999});
  const {data: vehiclesResult} = useVehicles({limit: 9999});
  const {data: suppliersResult} = useSuppliers({limit: 9999});
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
  const supplierOptions = (suppliersResult?.data ?? []).map(
    (s: {id: string; commercialName: string; cif: string}) => ({
      value: s.id,
      label: `${s.commercialName} (${s.cif})`,
    }),
  );

  const createMutation = useCreateDeliveryNote();
  const updateMutation = useUpdateDeliveryNote();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isEdit && existingNote) {
      const note = existingNote as {
        number: string | null;
        date: string;
        signed: boolean;
        projectId: string;
        workerId: string;
        vehicleId: string | null;
        vehicleText: string | null;
        observations: string | null;
        attachmentKey: string | null;
        attachmentName: string | null;
        lines: NoteLine[];
        purchaseNotes: {
          supplierId: string;
          number: string | null;
          date: string;
          attachmentKey: string | null;
          attachmentName: string | null;
          lines: NoteLine[];
        }[];
      };
      setNumber(note.number ?? "");
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
      setObservations(note.observations ?? "");
      setAttachmentKey(note.attachmentKey);
      setAttachmentName(note.attachmentName);
      setLines(
        note.lines.map((line) => ({
          materialId: line.materialId,
          serviceId: line.serviceId,
          unitType: line.unitType,
          quantity: line.quantity,
          price: line.price,
        })),
      );
      setPurchaseNotes(
        (note.purchaseNotes ?? []).map((purchase) => ({
          supplierId: purchase.supplierId,
          number: purchase.number ?? "",
          date: purchase.date.split("T")[0],
          attachmentKey: purchase.attachmentKey,
          attachmentName: purchase.attachmentName,
          lines: purchase.lines.map((line) => ({
            materialId: line.materialId,
            serviceId: line.serviceId,
            unitType: line.unitType,
            quantity: line.quantity,
            price: line.price,
          })),
        })),
      );
      setFormReady(true);
    }
  }, [isEdit, existingNote]);

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

  const updatePurchaseNote = (index: number, patch: Partial<PurchaseNote>) => {
    setPurchaseNotes(
      purchaseNotes.map((note, i) => (i === index ? {...note, ...patch} : note)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseNotes.some((note) => !note.supplierId)) {
      toast.error("Cada albarán de compra necesita un proveedor");
      return;
    }
    if (pendingUploads > 0) {
      toast.error("Espera a que termine la subida del archivo");
      return;
    }

    const payload = {
      number: number.trim() || null,
      date,
      signed: signed === "true",
      projectId,
      workerId,
      vehicleId: !isManualVehicle ? vehicleId : null,
      vehicleText: isManualVehicle ? vehicleText || null : null,
      observations: observations.trim() || null,
      attachmentKey,
      attachmentName,
      lines: toPayloadLines(lines),
      purchaseNotes: purchaseNotes.map((note) => ({
        supplierId: note.supplierId,
        number: note.number.trim() || null,
        date: note.date,
        attachmentKey: note.attachmentKey,
        attachmentName: note.attachmentName,
        lines: toPayloadLines(note.lines),
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
        title={isEdit ? "Editar albarán de venta" : "Añadir nuevo albarán de venta"}
      />

      {!formReady ? (
        <Loader />
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <Card className="p-4">
            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AppInput
                  label="Nº albarán"
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
                <AppSelect
                  label="Firmado"
                  options={SIGNED_OPTIONS}
                  value={signed}
                  onChange={(v) => setSigned(v || "false")}
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
                {isManualVehicle && (
                  <AppInput
                    label="Vehículo (manual)"
                    placeholder="Escribir nombre del vehículo"
                    value={vehicleText}
                    onChange={(e) => setVehicleText(e.target.value)}
                  />
                )}
                <div className="sm:col-span-2 lg:col-span-3">
                  <AppTextarea
                    label="Observaciones"
                    placeholder="Añadir observaciones"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <AttachmentField
                    folder="delivery-notes"
                    fileKey={attachmentKey}
                    fileName={attachmentName}
                    onChange={({key, fileName}) => {
                      setAttachmentKey(key);
                      setAttachmentName(fileName);
                    }}
                    onBusyChange={(busy) =>
                      setPendingUploads((count) =>
                        Math.max(0, count + (busy ? 1 : -1)),
                      )
                    }
                  />
                </div>
              </div>

              <DeliveryNoteLines
                lines={lines}
                materialOptions={materialOptions}
                serviceOptions={serviceOptions}
                onChange={setLines}
              />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconFileInvoice size={20} className="text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Albaranes de compra</h3>
                  </div>
                  <ButtonBordered
                    label="Añadir albarán de compra"
                    color="blue-600"
                    startContent={<IconPlus />}
                    onPress={() =>
                      setPurchaseNotes([...purchaseNotes, emptyPurchaseNote()])
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  La obra y el operario son los del albarán de venta.
                </p>
                {purchaseNotes.map((purchase, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-4 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold">
                        Albarán de compra {index + 1}
                      </h4>
                      <ButtonTable
                        tooltip="Quitar albarán de compra"
                        icon={<IconTrash size={20} className="stroke-red-600" />}
                        onClick={() =>
                          setPurchaseNotes(
                            purchaseNotes.filter((_, i) => i !== index),
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <AppCombobox
                        label="Proveedor"
                        isRequired
                        placeholder="Seleccionar proveedor"
                        options={supplierOptions}
                        value={purchase.supplierId}
                        onChange={(value) =>
                          updatePurchaseNote(index, {supplierId: value})
                        }
                        createLabel="Añadir nuevo proveedor"
                        renderCreateForm={(close) => (
                          <SupplierForm
                            item={null}
                            onClose={close}
                            onCreated={(id) =>
                              updatePurchaseNote(index, {supplierId: id})
                            }
                          />
                        )}
                      />
                      <AppInput
                        label="Nº albarán"
                        value={purchase.number}
                        onChange={(e) =>
                          updatePurchaseNote(index, {number: e.target.value})
                        }
                      />
                      <AppInput
                        label="Fecha"
                        type="date"
                        isRequired
                        value={purchase.date}
                        onChange={(e) =>
                          updatePurchaseNote(index, {date: e.target.value})
                        }
                      />
                    </div>
                    <AttachmentField
                      folder="purchase-notes"
                      fileKey={purchase.attachmentKey}
                      fileName={purchase.attachmentName}
                      onChange={({key, fileName}) =>
                        updatePurchaseNote(index, {
                          attachmentKey: key,
                          attachmentName: fileName,
                        })
                      }
                      onBusyChange={(busy) =>
                        setPendingUploads((count) =>
                          Math.max(0, count + (busy ? 1 : -1)),
                        )
                      }
                    />
                    <DeliveryNoteLines
                      lines={purchase.lines}
                      materialOptions={materialOptions}
                      serviceOptions={serviceOptions}
                      onChange={(next) => updatePurchaseNote(index, {lines: next})}
                    />
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
                  isDisabled={
                    isPending || pendingUploads > 0 || !projectId || !workerId
                  }
                />
              </div>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
