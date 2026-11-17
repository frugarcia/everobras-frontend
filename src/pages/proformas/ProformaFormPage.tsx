import {useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {IconCancel, IconCirclePlus, IconDeviceFloppy, IconEdit} from "@tabler/icons-react";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import GoBackTitle from "@/components/GoBackTitle";
import Loader from "@/components/Loader";
import {AppCombobox} from "@/components/ui/app-combobox";
import {AppInput} from "@/components/ui/app-input";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {
  useCreateProforma,
  useDeliveryNotes,
  usePreviewProforma,
  useProforma,
  useProformas,
  useProjects,
  useUpdateProforma,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {ProjectForm} from "@/pages/maintenance/ProjectsPage";
import ProformaLines from "./ProformaLines";
import {
  EMPTY_PROFORMA_LINE,
  VAT_RATE,
  formatDay,
  formatEuros,
  localISODate,
  parseAmount,
  proformaTotals,
  type ProformaLineDraft,
} from "./money";

export default function ProformaFormPage() {
  const {id} = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const today = localISODate();

  const [projectId, setProjectId] = useState(searchParams.get("obra") ?? "");
  const [date, setDate] = useState(today);
  const [orderNumber, setOrderNumber] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lines, setLines] = useState<ProformaLineDraft[]>([EMPTY_PROFORMA_LINE]);
  const [formReady, setFormReady] = useState(!isEdit);

  const {data: projectsResult} = useProjects({limit: 9999});
  const {data: existing} = useProforma(id ?? "");
  const {data: projectNotes = []} = useDeliveryNotes(
    projectId ? {projectId} : undefined,
    Boolean(projectId),
  );
  const {data: projectProformas = []} = useProformas(
    projectId ? {projectId} : undefined,
    Boolean(projectId),
  );
  const projectOptions = (projectsResult?.data ?? []).map(
    (project: {id: string; name: string; customer?: {name: string}}) => ({
      value: project.id,
      label: `${project.name} (${project.customer?.name ?? ""})`,
    }),
  );

  const previewMutation = usePreviewProforma();
  const createMutation = useCreateProforma();
  const updateMutation = useUpdateProforma();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isEdit || !existing) return;
    const proforma = existing as {
      date: string;
      projectId: string;
      orderNumber: string | null;
      periodLabel: string;
      lines: {
        partNumbers: string;
        description: string;
        unit: string;
        quantity: number;
        unitPrice: number;
        deliveryNoteIds: string[];
      }[];
    };
    setProjectId(proforma.projectId);
    setDate(proforma.date.split("T")[0]);
    setOrderNumber(proforma.orderNumber ?? "");
    setPeriodLabel(proforma.periodLabel);
    setLines(
      proforma.lines.map((line) => ({
        partNumbers: line.partNumbers,
        description: line.description,
        unit: line.unit,
        quantity: String(line.quantity),
        unitPrice: String(line.unitPrice),
        deliveryNoteIds: line.deliveryNoteIds,
      })),
    );
    setSelectedIds([
      ...new Set(proforma.lines.flatMap((line) => line.deliveryNoteIds)),
    ]);
    setFormReady(true);
  }, [isEdit, existing]);

  const billedIds = new Set(
    (projectProformas as {id: string; lines: {deliveryNoteIds: string[]}[]}[])
      .filter((proforma) => proforma.id !== id)
      .flatMap((proforma) => proforma.lines.flatMap((line) => line.deliveryNoteIds)),
  );
  const notes = (projectNotes as {
    id: string;
    number: string | null;
    date: string;
    worker: {firstName: string; lastName: string} | null;
  }[])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const changeProject = (value: string) => {
    if (value === projectId) return;
    setProjectId(value);
    setSelectedIds([]);
    setLines([EMPTY_PROFORMA_LINE]);
  };

  const toggleNote = (noteId: string) => {
    setSelectedIds((current) =>
      current.includes(noteId)
        ? current.filter((item) => item !== noteId)
        : [...current, noteId],
    );
  };

  const loadNotes = async () => {
    if (!projectId) {
      toast.error("Selecciona la obra");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un albarán de venta");
      return;
    }
    try {
      const result = (await previewMutation.mutateAsync({
        projectId,
        deliveryNoteIds: selectedIds,
        ...(id ? {proformaId: id} : {}),
      })) as {
        lines: {
          partNumbers: string;
          description: string;
          unit: string;
          quantity: number;
          unitPrice: number;
          deliveryNoteIds: string[];
        }[];
      };
      if (result.lines.length === 0) {
        toast.error("Los albaranes seleccionados no tienen líneas");
        return;
      }
      setLines(
        result.lines.map((line) => ({
          partNumbers: line.partNumbers,
          description: line.description,
          unit: line.unit,
          quantity: String(line.quantity),
          unitPrice: String(line.unitPrice),
          deliveryNoteIds: line.deliveryNoteIds,
        })),
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "No se han podido cargar los albaranes"));
    }
  };

  const parsedLines = lines.map((line) => ({
    quantity: parseAmount(line.quantity),
    unitPrice: parseAmount(line.unitPrice),
  }));
  const totals = proformaTotals(
    parsedLines
      .filter((line) => line.quantity != null && line.unitPrice != null)
      .map((line) => ({quantity: line.quantity ?? 0, unitPrice: line.unitPrice ?? 0})),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error("Selecciona la obra");
      return;
    }
    if (!periodLabel.trim()) {
      toast.error("Indica el mes o el periodo");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un albarán de venta");
      return;
    }
    const linkedIds = [
      ...new Set(lines.flatMap((line) => line.deliveryNoteIds)),
    ];
    const sameNotes =
      linkedIds.length === selectedIds.length &&
      selectedIds.every((noteId) => linkedIds.includes(noteId));
    if (!sameNotes) {
      toast.error("Genera las partidas de los albaranes seleccionados");
      return;
    }
    const payloadLines = lines.map((line) => ({
      partNumbers: line.partNumbers.trim(),
      description: line.description.trim(),
      unit: line.unit.trim(),
      quantity: parseAmount(line.quantity),
      unitPrice: parseAmount(line.unitPrice),
      deliveryNoteIds: line.deliveryNoteIds,
    }));
    if (
      payloadLines.some(
        (line) => !line.description || !line.unit || line.quantity == null || line.unitPrice == null,
      )
    ) {
      toast.error("Cada línea necesita partida, unidad, medición y precio");
      return;
    }
    const payload = {
      date,
      projectId,
      orderNumber: orderNumber.trim() || null,
      periodLabel: periodLabel.trim(),
      vatRate: VAT_RATE,
      lines: payloadLines,
    };
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({id, data: payload});
        toast.success("Proforma actualizada correctamente");
        navigate(`/proformas/${id}`);
      } else {
        const created = (await createMutation.mutateAsync(payload)) as {id: string};
        toast.success("Proforma creada correctamente");
        navigate(`/proformas/${created.id}`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Error al guardar la proforma"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <GoBackTitle
        icon={isEdit ? <IconEdit /> : <IconCirclePlus />}
        title={isEdit ? "Editar proforma" : "Nueva proforma"}
      />
      {!formReady ? (
        <Loader />
      ) : (
        <form noValidate onSubmit={handleSubmit}>
          <Card className="p-4">
            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AppCombobox
                  label="Obra"
                  isRequired
                  placeholder="Seleccionar obra"
                  options={projectOptions}
                  value={projectId}
                  onChange={changeProject}
                  createLabel="Añadir nueva obra"
                  renderCreateForm={(close) => (
                    <ProjectForm item={null} onClose={close} onCreated={changeProject} />
                  )}
                />
                <AppInput
                  label="Fecha"
                  type="date"
                  isRequired
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <AppInput
                  label="Nº pedido"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
                <AppInput
                  label="Mes"
                  isRequired
                  placeholder="oct-26"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Albaranes de venta</h3>
                    <p className="text-sm text-muted-foreground">
                      Elige uno o varios de la misma obra. La medición suma las unidades de cada tipo.
                    </p>
                  </div>
                  <ButtonBordered
                    label="Generar partidas"
                    color="blue-600"
                    isLoading={previewMutation.isPending}
                    isDisabled={selectedIds.length === 0}
                    onPress={loadNotes}
                  />
                </div>
                {!projectId ? (
                  <p className="text-sm text-muted-foreground">
                    Selecciona la obra para ver sus albaranes.
                  </p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Esta obra no tiene albaranes de venta.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {notes.map((note) => {
                      const billed = billedIds.has(note.id);
                      const worker = `${note.worker?.firstName ?? ""} ${note.worker?.lastName ?? ""}`.trim();
                      return (
                        <label
                          key={note.id}
                          className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="size-4"
                            checked={selectedIds.includes(note.id)}
                            disabled={billed}
                            onChange={() => toggleNote(note.id)}
                          />
                          <span className="font-medium">
                            Nº {note.number ?? "—"}
                          </span>
                          <span>{formatDay(note.date)}</span>
                          <span className="text-muted-foreground">{worker || "—"}</span>
                          {billed ? (
                            <span className="text-muted-foreground">
                              Ya está en una proforma
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <ProformaLines lines={lines} onChange={setLines} />
              <div className="flex justify-end gap-6 text-sm">
                <span>Base {formatEuros(totals.base)}</span>
                <span>IVA 21 % {formatEuros(totals.vat)}</span>
                <span className="font-semibold">Total {formatEuros(totals.total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full justify-end gap-4">
                <ButtonBordered
                  label="Cancelar"
                  color="red-600"
                  startContent={<IconCancel />}
                  onPress={() => navigate("/proformas")}
                  isDisabled={isPending}
                />
                <ButtonBordered
                  label={isEdit ? "Guardar cambios" : "Crear proforma"}
                  color="green-600"
                  type="submit"
                  startContent={<IconDeviceFloppy />}
                  isLoading={isPending}
                  isDisabled={isPending || !projectId}
                />
              </div>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
