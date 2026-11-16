import {useNavigate, useParams} from "react-router-dom";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {IconEdit, IconFileText, IconList} from "@tabler/icons-react";
import ButtonBordered from "@/components/ButtonBordered";
import GoBackTitle from "@/components/GoBackTitle";
import ItemCard from "@/components/ItemCard";
import RenderWhenLoad from "@/components/RenderWhenLoad";
import Table from "@/components/Table";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {useDeliveryNote} from "@/hooks/useQueries";

interface DeliveryNoteLine {
  id: string;
  material: {name: string} | null;
  service: {name: string} | null;
  unitType: string;
  quantity: number;
  price: number;
}

interface DeliveryNote {
  id: string;
  type: string;
  internalNumber: string | null;
  externalNumber: string | null;
  date: string;
  signed: boolean;
  imageUrl: string | null;
  vehicle: {id: string; name: string; plate: string} | null;
  vehicleText: string | null;
  project: {name: string; customer: {name: string}};
  worker: {firstName: string; lastName: string};
  lines: DeliveryNoteLine[];
  createdAt: string;
  updatedAt: string;
  createdBy: {id: string; name: string} | null;
  updatedBy: {id: string; name: string} | null;
}

const euros = (value: number) =>
  new Intl.NumberFormat("es-ES", {style: "currency", currency: "EUR"}).format(
    value,
  );

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });

const lineColumns: ColumnDef<DeliveryNoteLine, unknown>[] = [
  {
    id: "material",
    header: "Material",
    cell: ({row}) => row.original.material?.name ?? "—",
  },
  {
    id: "service",
    header: "Servicio",
    cell: ({row}) => row.original.service?.name ?? "—",
  },
  {accessorKey: "unitType", header: "Tipo unidad"},
  {
    accessorKey: "quantity",
    header: "Cantidad",
    meta: {headerClassName: "text-right", rowClassName: "text-right"},
  },
  {
    id: "price",
    header: "Precio",
    meta: {headerClassName: "text-right", rowClassName: "text-right"},
    cell: ({row}) => euros(row.original.price),
  },
  {
    id: "total",
    header: "Total",
    meta: {
      headerClassName: "text-right",
      rowClassName: "text-right font-medium",
    },
    cell: ({row}) => euros(row.original.quantity * row.original.price),
  },
];

export default function DeliveryNoteDetailPage() {
  const {id = ""} = useParams();
  const navigate = useNavigate();
  const {data, isLoading, error} = useDeliveryNote(id);
  const note = data as DeliveryNote | undefined;

  const table = useReactTable({
    data: note?.lines ?? [],
    columns: lineColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: false,
    initialState: {pagination: {pageSize: 50}},
  });

  const total =
    note?.lines.reduce((sum, l) => sum + l.quantity * l.price, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GoBackTitle
          icon={<IconFileText />}
          title={`Albarán ${note?.internalNumber ?? ""}`.trim()}
          subtitle="Detalle del albarán"
        />
        {note ? (
          <ButtonBordered
            label="Editar albarán"
            color="blue-600"
            startContent={<IconEdit />}
            onPress={() => navigate(`/albaranes/${id}/editar`)}
          />
        ) : null}
      </div>

      <RenderWhenLoad isLoading={isLoading} error={error}>
        {note ? (
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ItemCard
                    label="Tipo"
                    value={
                      <Badge
                        variant={
                          note.type === "INTERNO" ? "secondary" : "outline"
                        }
                      >
                        {note.type}
                      </Badge>
                    }
                  />
                  <ItemCard
                    label="Nº interno"
                    value={note.internalNumber ?? "—"}
                  />
                  <ItemCard
                    label="Nº externo"
                    value={note.externalNumber ?? "—"}
                  />
                  <ItemCard
                    label="Fecha"
                    value={new Date(note.date).toLocaleDateString("es-ES")}
                  />
                  <ItemCard
                    label="Firmado"
                    value={
                      <Badge variant={note.signed ? "success" : "warning"}>
                        {note.signed ? "Sí" : "No"}
                      </Badge>
                    }
                  />
                  <ItemCard
                    label="Cliente"
                    value={note.project?.customer?.name ?? "—"}
                  />
                  <ItemCard label="Obra" value={note.project?.name ?? "—"} />
                  <ItemCard
                    label="Operario"
                    value={`${note.worker?.firstName ?? ""} ${note.worker?.lastName ?? ""}`.trim()}
                  />
                  <ItemCard
                    label="Vehículo"
                    value={
                      note.vehicle
                        ? `${note.vehicle.name} (${note.vehicle.plate})`
                        : (note.vehicleText ?? "—")
                    }
                  />
                  <ItemCard
                    label="Creado"
                    value={`${formatDateTime(note.createdAt)}${note.createdBy ? ` · ${note.createdBy.name}` : ""}`}
                  />
                  <ItemCard
                    label="Última modificación"
                    value={`${formatDateTime(note.updatedAt)}${note.updatedBy ? ` · ${note.updatedBy.name}` : ""}`}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <IconList size={20} className="text-muted-foreground" />
              <h3 className="text-lg font-semibold">Líneas del albarán</h3>
            </div>
            <Table title="Líneas del albarán" config={table} />
            <div className="flex justify-end">
              <ItemCard
                className="min-w-48 text-right"
                label="Total albarán"
                value={<span className="text-lg">{euros(total)}</span>}
              />
            </div>
          </div>
        ) : null}
      </RenderWhenLoad>
    </div>
  );
}
