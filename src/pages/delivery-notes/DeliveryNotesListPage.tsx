import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeliveryNotes, useDeleteDeliveryNote, useCustomers } from "@/hooks/useQueries";
import { useToast } from "@/components/ui/toast";
import axios from "axios";

interface DeliveryNote {
  id: string;
  type: string;
  internalNumber: string | null;
  externalNumber: string | null;
  date: string;
  signed: boolean;
  vehicle: { id: string; name: string; plate: string } | null;
  vehicleText: string | null;
  project: { id: string; name: string; customer: { id: string; name: string } };
  worker: { id: string; firstName: string; lastName: string };
  lines: unknown[];
}

export default function DeliveryNotesListPage() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [signedFilter, setSignedFilter] = useState("all");
  const [deleteItem, setDeleteItem] = useState<DeliveryNote | null>(null);
  const { showToast } = useToast();

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (customerFilter && customerFilter !== "all") p.customerId = customerFilter;
    if (signedFilter && signedFilter !== "all") p.signed = signedFilter;
    return p;
  }, [customerFilter, signedFilter]);

  const { data = [], isLoading } = useDeliveryNotes(params);
  const { data: customersResult } = useCustomers({limit: 9999});
  const customers = customersResult?.data ?? [];
  const deleteMutation = useDeleteDeliveryNote();

  const columns: ColumnDef<DeliveryNote, unknown>[] = [
    {
      id: "number",
      header: "Nº Albarán",
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.internalNumber ?? "-"}</span>
          {row.original.externalNumber && (
            <span className="text-muted-foreground text-xs ml-1">({row.original.externalNumber})</span>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "INTERNO" ? "secondary" : "outline"}>
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: "date",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString("es-ES"),
    },
    {
      id: "customer",
      header: "Cliente",
      cell: ({ row }) => row.original.project?.customer?.name ?? "-",
    },
    {
      id: "project",
      header: "Obra",
      cell: ({ row }) => row.original.project?.name ?? "-",
    },
    {
      id: "worker",
      header: "Operario",
      cell: ({ row }) => `${row.original.worker?.firstName ?? ""} ${row.original.worker?.lastName ?? ""}`.trim(),
    },
    {
      id: "vehicle",
      header: "Vehículo",
      cell: ({ row }) =>
        row.original.vehicle
          ? `${row.original.vehicle.name} (${row.original.vehicle.plate})`
          : row.original.vehicleText ?? "-",
    },
    {
      id: "signed",
      header: "Firmado",
      cell: ({ row }) => (
        <Badge variant={row.original.signed ? "success" : "warning"}>
          {row.original.signed ? "Sí" : "No"}
        </Badge>
      ),
    },
    {
      id: "lines",
      header: "Líneas",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.lines?.length ?? 0}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/albaranes/${row.original.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/albaranes/${row.original.id}/editar`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteItem(row.original)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 15 } },
  });

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMutation.mutateAsync(deleteItem.id);
      setDeleteItem(null);
    } catch (err) {
      setDeleteItem(null);
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        showToast(err.response.data.error, "error");
      } else {
        showToast("Error al eliminar el albarán", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Albaranes</h1>
          <p className="text-muted-foreground mt-1">Listado de albaranes</p>
        </div>
        <Button onClick={() => navigate("/albaranes/nuevo")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Albarán
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {customers.map((c: { id: string; name: string }) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={signedFilter} onValueChange={setSignedFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado firma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Firmados</SelectItem>
            <SelectItem value="false">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No se encontraron albaranes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} albarán(es)</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteItem !== null} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>¿Eliminar el albarán {deleteItem?.internalNumber}? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
