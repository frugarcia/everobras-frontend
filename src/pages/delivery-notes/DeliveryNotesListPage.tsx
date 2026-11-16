import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {IconEdit, IconEye, IconPlus, IconTrash} from "@tabler/icons-react";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import LinkTable from "@/components/LinkTable";
import RenderWhenLoad from "@/components/RenderWhenLoad";
import Table from "@/components/Table";
import TitleSegment from "@/components/TitleSegment";
import {Badge} from "@/components/ui/badge";
import {AppInput} from "@/components/ui/app-input";
import {AppSelect} from "@/components/ui/app-select";
import {
  useCustomers,
  useDeleteDeliveryNote,
  useDeliveryNotes,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import useModalStore from "@/store/useModalStore";

interface DeliveryNote {
  id: string;
  type: string;
  internalNumber: string | null;
  externalNumber: string | null;
  date: string;
  signed: boolean;
  vehicle: {id: string; name: string; plate: string} | null;
  vehicleText: string | null;
  project: {id: string; name: string; customer: {id: string; name: string}};
  worker: {id: string; firstName: string; lastName: string};
  lines: unknown[];
}

const SIGNED_FILTER_OPTIONS = [
  {value: "all", label: "Todos"},
  {value: "true", label: "Firmados"},
  {value: "false", label: "Pendientes"},
];

export default function DeliveryNotesListPage() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [signedFilter, setSignedFilter] = useState("all");
  const handleLaunchModal = useModalStore((state) => state.handleLaunchModal);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (customerFilter !== "all") p.customerId = customerFilter;
    if (signedFilter !== "all") p.signed = signedFilter;
    return p;
  }, [customerFilter, signedFilter]);

  const {data = [], isLoading, error} = useDeliveryNotes(params);
  const {data: customersResult} = useCustomers({limit: 9999});
  const customerOptions = [
    {value: "all", label: "Todos los clientes"},
    ...(customersResult?.data ?? []).map((c: {id: string; name: string}) => ({
      value: c.id,
      label: c.name,
    })),
  ];
  const deleteMutation = useDeleteDeliveryNote();

  function confirmDelete(note: DeliveryNote) {
    handleLaunchModal({
      title: "Eliminar albarán",
      text: "¿Está seguro que desea eliminar el albarán seleccionado?",
      description: `Nº ${note.internalNumber ?? note.externalNumber ?? "—"} · ${note.project?.name ?? ""}`,
      subText: "Esta acción no se podrá deshacer.",
      type: "delete",
      promise: async () => {
        try {
          await deleteMutation.mutateAsync(note.id);
          toast.success("Albarán eliminado correctamente");
        } catch (err) {
          toast.error(getErrorMessage(err, "Error al eliminar el albarán"));
        }
      },
    });
  }

  const columns: ColumnDef<DeliveryNote, unknown>[] = [
    {
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      meta: {headerClassName: "w-28 text-center"},
      cell: ({row}) => (
        <div className="flex items-center justify-center gap-2">
          <LinkTable
            to={`/albaranes/${row.original.id}`}
            tooltip="Ver detalle"
            icon={<IconEye size={20} className="stroke-green-600" />}
          />
          <LinkTable
            to={`/albaranes/${row.original.id}/editar`}
            tooltip="Editar albarán"
            icon={<IconEdit size={20} className="stroke-blue-700" />}
          />
          <ButtonTable
            tooltip="Eliminar albarán"
            icon={<IconTrash size={20} className="stroke-red-600" />}
            onClick={() => confirmDelete(row.original)}
          />
        </div>
      ),
    },
    {
      id: "number",
      header: "Nº Albarán",
      accessorFn: (row) =>
        [row.internalNumber, row.externalNumber].filter(Boolean).join(" "),
      cell: ({row}) => (
        <div>
          <span className="font-medium">
            {row.original.internalNumber ?? "—"}
          </span>
          {row.original.externalNumber && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({row.original.externalNumber})
            </span>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      accessorKey: "type",
      cell: ({row}) => (
        <Badge
          variant={row.original.type === "INTERNO" ? "secondary" : "outline"}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: "date",
      header: "Fecha",
      accessorKey: "date",
      cell: ({row}) =>
        new Date(row.original.date).toLocaleDateString("es-ES"),
    },
    {
      id: "customer",
      header: "Cliente",
      accessorFn: (row) => row.project?.customer?.name ?? "",
      cell: (info) => (info.getValue() as string) || "—",
    },
    {
      id: "project",
      header: "Obra",
      accessorFn: (row) => row.project?.name ?? "",
      cell: (info) => (info.getValue() as string) || "—",
    },
    {
      id: "worker",
      header: "Operario",
      accessorFn: (row) =>
        `${row.worker?.firstName ?? ""} ${row.worker?.lastName ?? ""}`.trim(),
    },
    {
      id: "vehicle",
      header: "Vehículo",
      accessorFn: (row) =>
        row.vehicle
          ? `${row.vehicle.name} (${row.vehicle.plate})`
          : (row.vehicleText ?? ""),
      cell: (info) => (info.getValue() as string) || "—",
    },
    {
      id: "signed",
      header: "Firmado",
      accessorKey: "signed",
      cell: ({row}) => (
        <Badge variant={row.original.signed ? "success" : "warning"}>
          {row.original.signed ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      id: "lines",
      header: "Líneas",
      accessorFn: (row) => row.lines?.length ?? 0,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {globalFilter},
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {pageSize: 15},
      sorting: [{id: "date", desc: true}],
    },
    meta: {isLoading},
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <TitleSegment path="/albaranes" />
      <div className="flex flex-col gap-6 py-4">
        <ButtonBordered
          label="Añadir nuevo albarán"
          color="green-600"
          onPress={() => navigate("/albaranes/nuevo")}
          startContent={<IconPlus />}
          className="w-fit"
        />
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <AppInput
            type="text"
            label="Buscar..."
            placeholder="Introduzca el texto a buscar..."
            value={globalFilter}
            onChange={(ev) => setGlobalFilter(ev.target.value)}
            isClearable
            onClear={() => setGlobalFilter("")}
          />
          <AppSelect
            label="Cliente"
            options={customerOptions}
            value={customerFilter}
            onChange={(v) => setCustomerFilter(v || "all")}
          />
          <AppSelect
            label="Estado de firma"
            options={SIGNED_FILTER_OPTIONS}
            value={signedFilter}
            onChange={(v) => setSignedFilter(v || "all")}
          />
        </div>
        <RenderWhenLoad isLoading={false} error={error}>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              Total albaranes: {table.getFilteredRowModel().rows.length}
            </p>
            <Table title="Tabla de albaranes" config={table} />
          </div>
        </RenderWhenLoad>
      </div>
    </div>
  );
}
