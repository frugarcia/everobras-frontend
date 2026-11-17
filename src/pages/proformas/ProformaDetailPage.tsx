import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {IconDownload, IconEdit, IconFileInvoice, IconList} from "@tabler/icons-react";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import GoBackTitle from "@/components/GoBackTitle";
import ItemCard from "@/components/ItemCard";
import RenderWhenLoad from "@/components/RenderWhenLoad";
import Table from "@/components/Table";
import {Card, CardContent} from "@/components/ui/card";
import {useProforma} from "@/hooks/useQueries";
import {proformasApi} from "@/lib/api";
import {getErrorMessage} from "@/lib/errors";
import {
  formatDay,
  formatEuros,
  formatQuantity,
  lineAmount,
  proformaTotals,
} from "./money";

interface ProformaLine {
  id: string;
  partNumbers: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

interface Proforma {
  id: string;
  number: string;
  date: string;
  orderNumber: string | null;
  periodLabel: string;
  dateFrom: string;
  dateTo: string;
  vatRate: number;
  project: {name: string; customer: {name: string}};
  lines: ProformaLine[];
  createdAt: string;
  updatedAt: string;
  createdBy: {name: string} | null;
  updatedBy: {name: string} | null;
}

const columns: ColumnDef<ProformaLine, unknown>[] = [
  {accessorKey: "partNumbers", header: "Nº partida", cell: ({row}) => row.original.partNumbers || "—"},
  {accessorKey: "description", header: "Partida"},
  {accessorKey: "unit", header: "Ud"},
  {
    id: "quantity",
    header: "Medición",
    meta: {headerClassName: "text-right", rowClassName: "text-right"},
    cell: ({row}) => formatQuantity(row.original.quantity),
  },
  {
    id: "unitPrice",
    header: "Precio unit.",
    meta: {headerClassName: "text-right", rowClassName: "text-right"},
    cell: ({row}) => formatQuantity(row.original.unitPrice),
  },
  {
    id: "amount",
    header: "Importe",
    meta: {headerClassName: "text-right", rowClassName: "text-right font-medium"},
    cell: ({row}) => formatEuros(lineAmount(row.original.quantity, row.original.unitPrice)),
  },
];

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-ES", {dateStyle: "short", timeStyle: "short"});

export default function ProformaDetailPage() {
  const {id = ""} = useParams();
  const navigate = useNavigate();
  const {data, isLoading, error} = useProforma(id);
  const proforma = data as Proforma | undefined;
  const [downloading, setDownloading] = useState(false);
  const totals = proformaTotals(proforma?.lines ?? [], proforma?.vatRate);

  const table = useReactTable({
    data: proforma?.lines ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: false,
    initialState: {pagination: {pageSize: 50}},
  });

  const download = async () => {
    if (!proforma) return;
    setDownloading(true);
    try {
      const blob = await proformasApi.download(proforma.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proforma-${proforma.number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, "No se ha podido descargar el PDF"));
    } finally {
      setDownloading(false);
    }
  };

  const vatLabel = proforma
    ? `${Math.round(proforma.vatRate * 10000) / 100} %`
    : "21 %";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GoBackTitle
          icon={<IconFileInvoice />}
          title={`Proforma ${proforma?.number ?? ""}`.trim()}
          subtitle="Factura proforma"
        />
        {proforma ? (
          <div className="flex gap-3">
            <ButtonBordered
              label="Descargar PDF"
              color="green-600"
              startContent={<IconDownload />}
              isLoading={downloading}
              onPress={download}
            />
            <ButtonBordered
              label="Editar proforma"
              color="blue-600"
              startContent={<IconEdit />}
              onPress={() => navigate(`/proformas/${id}/editar`)}
            />
          </div>
        ) : null}
      </div>
      <RenderWhenLoad isLoading={isLoading} error={error}>
        {proforma ? (
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <ItemCard label="Nº proforma" value={proforma.number} />
                  <ItemCard label="Fecha" value={formatDay(proforma.date)} />
                  <ItemCard label="Nº pedido" value={proforma.orderNumber || "—"} />
                  <ItemCard label="Cliente" value={proforma.project.customer.name} />
                  <ItemCard label="Obra" value={proforma.project.name} />
                  <ItemCard label="Mes" value={proforma.periodLabel} />
                  <ItemCard
                    label="Fechas de los albaranes"
                    value={`${formatDay(proforma.dateFrom)} – ${formatDay(proforma.dateTo)}`}
                  />
                  <ItemCard
                    label="Creado"
                    value={`${formatDateTime(proforma.createdAt)}${proforma.createdBy ? ` · ${proforma.createdBy.name}` : ""}`}
                  />
                  <ItemCard
                    label="Última modificación"
                    value={`${formatDateTime(proforma.updatedAt)}${proforma.updatedBy ? ` · ${proforma.updatedBy.name}` : ""}`}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center gap-2">
              <IconList size={20} className="text-muted-foreground" />
              <h3 className="text-lg font-semibold">Partidas</h3>
            </div>
            <Table title="Partidas de la proforma" config={table} />
            <div className="flex justify-end gap-4">
              <ItemCard label="Base" value={formatEuros(totals.base)} />
              <ItemCard label={`IVA ${vatLabel}`} value={formatEuros(totals.vat)} />
              <ItemCard
                label="Total"
                value={<span className="text-lg">{formatEuros(totals.total)}</span>}
              />
            </div>
          </div>
        ) : null}
      </RenderWhenLoad>
    </div>
  );
}
