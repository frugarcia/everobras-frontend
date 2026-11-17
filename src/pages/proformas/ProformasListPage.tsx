import {useState} from "react";
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
import {AppInput} from "@/components/ui/app-input";
import {useDeleteProforma, useProformas} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import useModalStore from "@/store/useModalStore";
import {formatDay, formatEuros, proformaTotals} from "./money";

interface ProformaRow {
  id: string;
  number: string;
  date: string;
  periodLabel: string;
  vatRate: number;
  project: {name: string; customer: {name: string}};
  lines: {quantity: number; unitPrice: number}[];
}

export default function ProformasListPage() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const handleLaunchModal = useModalStore((state) => state.handleLaunchModal);
  const {data = [], isLoading, error} = useProformas();
  const deleteMutation = useDeleteProforma();

  function confirmDelete(proforma: ProformaRow) {
    handleLaunchModal({
      title: "Eliminar proforma",
      text: "¿Está seguro que desea eliminar la proforma seleccionada?",
      description: `Nº ${proforma.number} · ${proforma.project?.name ?? ""}`,
      subText: "Los albaranes quedarán libres para otra proforma.",
      type: "delete",
      promise: async () => {
        try {
          await deleteMutation.mutateAsync(proforma.id);
          toast.success("Proforma eliminada correctamente");
        } catch (err) {
          toast.error(getErrorMessage(err, "Error al eliminar la proforma"));
        }
      },
    });
  }

  const columns: ColumnDef<ProformaRow, unknown>[] = [
    {
      id: "actions",
      header: "Acciones",
      enableSorting: false,
      meta: {headerClassName: "w-28 text-center"},
      cell: ({row}) => (
        <div className="flex items-center justify-center gap-2">
          <LinkTable
            to={`/proformas/${row.original.id}`}
            tooltip="Ver detalle"
            icon={<IconEye size={20} className="stroke-green-600" />}
          />
          <LinkTable
            to={`/proformas/${row.original.id}/editar`}
            tooltip="Editar proforma"
            icon={<IconEdit size={20} className="stroke-blue-700" />}
          />
          <ButtonTable
            tooltip="Eliminar proforma"
            icon={<IconTrash size={20} className="stroke-red-600" />}
            onClick={() => confirmDelete(row.original)}
          />
        </div>
      ),
    },
    {
      id: "number",
      header: "Nº proforma",
      accessorKey: "number",
      cell: ({row}) => <span className="font-medium">{row.original.number}</span>,
    },
    {
      id: "date",
      header: "Fecha",
      accessorKey: "date",
      cell: ({row}) => formatDay(row.original.date),
    },
    {
      id: "period",
      header: "Periodo",
      accessorKey: "periodLabel",
    },
    {
      id: "customer",
      header: "Cliente",
      accessorFn: (row) => row.project?.customer?.name ?? "",
    },
    {
      id: "project",
      header: "Obra",
      accessorFn: (row) => row.project?.name ?? "",
    },
    {
      id: "total",
      header: "Total",
      accessorFn: (row) => proformaTotals(row.lines, row.vatRate).total,
      meta: {headerClassName: "text-right", rowClassName: "text-right"},
      cell: ({row}) => formatEuros(proformaTotals(row.original.lines, row.original.vatRate).total),
    },
  ];

  const table = useReactTable({
    data: data as ProformaRow[],
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
      <TitleSegment path="/proformas" />
      <div className="flex flex-col gap-6 py-4">
        <ButtonBordered
          label="Nueva proforma"
          color="green-600"
          onPress={() => navigate("/proformas/nuevo")}
          startContent={<IconPlus />}
          className="w-fit"
        />
        <AppInput
          type="text"
          label="Buscar..."
          placeholder="Introduzca el texto a buscar..."
          value={globalFilter}
          onChange={(ev) => setGlobalFilter(ev.target.value)}
          isClearable
          onClear={() => setGlobalFilter("")}
        />
        <RenderWhenLoad isLoading={false} error={error}>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              Total proformas: {table.getFilteredRowModel().rows.length}
            </p>
            <Table title="Tabla de proformas" config={table} />
          </div>
        </RenderWhenLoad>
      </div>
    </div>
  );
}
