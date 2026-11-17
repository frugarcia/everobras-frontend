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
import {useDeleteInternalPart, useInternalParts} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import useModalStore from "@/store/useModalStore";
import {TYPE_LABEL, TYPE_OPTIONS, type PartType} from "./partLines";

interface InternalPartRow {
  id: string;
  type: PartType;
  number: string | null;
  date: string;
  vehicle: {id: string; name: string; plate: string} | null;
  vehicleText: string | null;
  project: {id: string; name: string; customer: {id: string; name: string}};
  worker: {id: string; firstName: string; lastName: string};
  lines: unknown[];
}

const TYPE_FILTER_OPTIONS = [{value: "all", label: "Todos"}, ...TYPE_OPTIONS];

export default function InternalPartsListPage() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const handleLaunchModal = useModalStore((state) => state.handleLaunchModal);
  const {data = [], isLoading, error} = useInternalParts();
  const deleteMutation = useDeleteInternalPart();

  const rows = useMemo(
    () =>
      (data as InternalPartRow[]).filter(
        (part) => typeFilter === "all" || part.type === typeFilter,
      ),
    [data, typeFilter],
  );

  function confirmDelete(part: InternalPartRow) {
    handleLaunchModal({
      title: "Eliminar parte interno",
      text: "¿Está seguro que desea eliminar el parte interno seleccionado?",
      description: `Nº ${part.number ?? "—"} · ${part.project?.name ?? ""}`,
      subText: "Esta acción no se podrá deshacer.",
      type: "delete",
      promise: async () => {
        try {
          await deleteMutation.mutateAsync(part.id);
          toast.success("Parte interno eliminado correctamente");
        } catch (err) {
          toast.error(getErrorMessage(err, "Error al eliminar el parte interno"));
        }
      },
    });
  }

  const columns: ColumnDef<InternalPartRow, unknown>[] = [
    {
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      meta: {headerClassName: "w-28 text-center"},
      cell: ({row}) => (
        <div className="flex items-center justify-center gap-2">
          <LinkTable
            to={`/partes-internos/${row.original.id}`}
            tooltip="Ver detalle"
            icon={<IconEye size={20} className="stroke-green-600" />}
          />
          <LinkTable
            to={`/partes-internos/${row.original.id}/editar`}
            tooltip="Editar parte"
            icon={<IconEdit size={20} className="stroke-blue-700" />}
          />
          <ButtonTable
            tooltip="Eliminar parte"
            icon={<IconTrash size={20} className="stroke-red-600" />}
            onClick={() => confirmDelete(row.original)}
          />
        </div>
      ),
    },
    {
      id: "number",
      header: "Nº parte",
      accessorFn: (row) => row.number ?? "",
      cell: ({row}) => (
        <span className="font-medium">{row.original.number ?? "—"}</span>
      ),
    },
    {
      id: "date",
      header: "Fecha",
      accessorKey: "date",
      cell: ({row}) => new Date(row.original.date).toLocaleDateString("es-ES"),
    },
    {
      id: "type",
      header: "Tipo",
      accessorFn: (row) => TYPE_LABEL[row.type],
      cell: ({row}) => (
        <Badge
          className={
            row.original.type === "CAMIONES"
              ? "bg-sky-100 text-sky-800"
              : "bg-violet-100 text-violet-800"
          }
        >
          {TYPE_LABEL[row.original.type]}
        </Badge>
      ),
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
      id: "lines",
      header: "Líneas",
      accessorFn: (row) => row.lines?.length ?? 0,
    },
  ];

  const table = useReactTable({
    data: rows,
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
      <TitleSegment path="/partes-internos" />
      <div className="flex flex-col gap-6 py-4">
        <ButtonBordered
          label="Añadir nuevo parte interno"
          color="green-600"
          onPress={() => navigate("/partes-internos/nuevo")}
          startContent={<IconPlus />}
          className="w-fit"
        />
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
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
            label="Tipo"
            options={TYPE_FILTER_OPTIONS}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value || "all")}
          />
        </div>
        <RenderWhenLoad isLoading={false} error={error}>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              Total partes internos: {table.getFilteredRowModel().rows.length}
            </p>
            <Table title="Tabla de partes internos" config={table} />
          </div>
        </RenderWhenLoad>
      </div>
    </div>
  );
}
