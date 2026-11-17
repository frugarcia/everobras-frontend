import {useNavigate, useParams} from "react-router-dom";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {IconClipboardList, IconEdit, IconList} from "@tabler/icons-react";
import ButtonBordered from "@/components/ButtonBordered";
import GoBackTitle from "@/components/GoBackTitle";
import ItemCard from "@/components/ItemCard";
import RenderWhenLoad from "@/components/RenderWhenLoad";
import Table from "@/components/Table";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {useInternalPart} from "@/hooks/useQueries";
import {
  MEASURE_LABEL,
  TYPE_LABEL,
  formatQuantity,
  type PartMeasure,
  type PartType,
} from "./partLines";

interface PartLine {
  id: string;
  loadText: string | null;
  unloadText: string | null;
  amount: number | null;
  measure: PartMeasure | null;
  startTime: string | null;
  endTime: string | null;
  totalHours: number | null;
  workDescription: string | null;
}

interface InternalPart {
  id: string;
  type: PartType;
  number: string | null;
  date: string;
  startKm: number | null;
  endKm: number | null;
  dieselLiters: number | null;
  workedHours: number | null;
  machineHours: number | null;
  vehicle: {name: string; plate: string} | null;
  vehicleText: string | null;
  project: {name: string; customer: {name: string}};
  worker: {firstName: string; lastName: string};
  lines: PartLine[];
  createdAt: string;
  updatedAt: string;
  createdBy: {name: string} | null;
  updatedBy: {name: string} | null;
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });

const truckColumns: ColumnDef<PartLine, unknown>[] = [
  {
    id: "loadText",
    header: "Carga",
    cell: ({row}) => row.original.loadText || "—",
  },
  {
    id: "unloadText",
    header: "Descarga",
    cell: ({row}) => row.original.unloadText || "—",
  },
  {
    id: "amount",
    header: "Total viaje/horas",
    meta: {headerClassName: "text-right", rowClassName: "text-right"},
    cell: ({row}) =>
      row.original.amount == null ? "—" : formatQuantity(row.original.amount),
  },
  {
    id: "measure",
    header: "Unidad",
    cell: ({row}) =>
      row.original.measure ? MEASURE_LABEL[row.original.measure] : "—",
  },
];

const machineColumns: ColumnDef<PartLine, unknown>[] = [
  {
    id: "startTime",
    header: "Hora inicio",
    cell: ({row}) => row.original.startTime || "—",
  },
  {
    id: "endTime",
    header: "Hora fin",
    cell: ({row}) => row.original.endTime || "—",
  },
  {
    id: "totalHours",
    header: "Total horas",
    meta: {headerClassName: "text-right", rowClassName: "text-right"},
    cell: ({row}) =>
      row.original.totalHours == null
        ? "—"
        : formatQuantity(row.original.totalHours),
  },
  {
    id: "workDescription",
    header: "Descripción del trabajo",
    cell: ({row}) => row.original.workDescription || "—",
  },
];

export default function InternalPartDetailPage() {
  const {id = ""} = useParams();
  const navigate = useNavigate();
  const {data, isLoading, error} = useInternalPart(id);
  const part = data as InternalPart | undefined;
  const columns = part?.type === "CAMIONES" ? truckColumns : machineColumns;

  const table = useReactTable({
    data: part?.lines ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: false,
    initialState: {pagination: {pageSize: 50}},
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GoBackTitle
          icon={<IconClipboardList />}
          title={`Parte interno ${part?.number ?? ""}`.trim()}
          subtitle="Detalle del parte interno"
        />
        {part ? (
          <ButtonBordered
            label="Editar parte"
            color="blue-600"
            startContent={<IconEdit />}
            onPress={() => navigate(`/partes-internos/${id}/editar`)}
          />
        ) : null}
      </div>

      <RenderWhenLoad isLoading={isLoading} error={error}>
        {part ? (
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ItemCard label="Nº parte" value={part.number ?? "—"} />
                  <ItemCard
                    label="Fecha"
                    value={new Date(part.date).toLocaleDateString("es-ES")}
                  />
                  <ItemCard
                    label="Tipo"
                    value={
                      <Badge
                        className={
                          part.type === "CAMIONES"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-violet-100 text-violet-800"
                        }
                      >
                        {TYPE_LABEL[part.type]}
                      </Badge>
                    }
                  />
                  <ItemCard
                    label="Cliente"
                    value={part.project?.customer?.name ?? "—"}
                  />
                  <ItemCard label="Obra" value={part.project?.name ?? "—"} />
                  <ItemCard
                    label="Operario"
                    value={`${part.worker?.firstName ?? ""} ${part.worker?.lastName ?? ""}`.trim()}
                  />
                  <ItemCard
                    label="Vehículo"
                    value={
                      part.vehicle
                        ? `${part.vehicle.name} (${part.vehicle.plate})`
                        : (part.vehicleText ?? "—")
                    }
                  />
                  {part.type === "CAMIONES" ? (
                    <>
                      <ItemCard
                        label="Kms inicio"
                        value={
                          part.startKm == null ? "—" : formatQuantity(part.startKm)
                        }
                      />
                      <ItemCard
                        label="Kms final"
                        value={part.endKm == null ? "—" : formatQuantity(part.endKm)}
                      />
                      <ItemCard
                        label="Litros gasoil"
                        value={
                          part.dieselLiters == null
                            ? "—"
                            : formatQuantity(part.dieselLiters)
                        }
                      />
                    </>
                  ) : null}
                  <ItemCard
                    label="Creado"
                    value={`${formatDateTime(part.createdAt)}${part.createdBy ? ` · ${part.createdBy.name}` : ""}`}
                  />
                  <ItemCard
                    label="Última modificación"
                    value={`${formatDateTime(part.updatedAt)}${part.updatedBy ? ` · ${part.updatedBy.name}` : ""}`}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <IconList size={20} className="text-muted-foreground" />
              <h3 className="text-lg font-semibold">Líneas del parte</h3>
            </div>
            <Table title="Líneas del parte interno" config={table} />

            {part.type === "MAQUINARIA" ? (
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold">Pie</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ItemCard
                    label="Total horas trabajadas"
                    value={
                      part.workedHours == null
                        ? "—"
                        : formatQuantity(part.workedHours)
                    }
                  />
                  <ItemCard
                    label="Total horas máquina"
                    value={
                      part.machineHours == null
                        ? "—"
                        : formatQuantity(part.machineHours)
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </RenderWhenLoad>
    </div>
  );
}
