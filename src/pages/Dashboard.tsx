import {Link} from "react-router-dom";
import {
  IconBuilding,
  IconCircleCheck,
  IconClipboardList,
  IconClockHour4,
  IconFileInvoice,
  IconFileText,
  IconPackage,
  IconTool,
  IconTruck,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import RenderWhenLoad from "@/components/RenderWhenLoad";
import TitleSegment from "@/components/TitleSegment";
import {Card, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {
  useCustomers,
  useDeliveryNotes,
  useInternalParts,
  useProformas,
  useMaterials,
  useServices,
  useVehicles,
  useWorkers,
} from "@/hooks/useQueries";

function StatCard({
  title,
  value,
  icon: IconCmp,
  to,
  iconClassName = "bg-primary/10 text-primary",
}: {
  title: string;
  value: number;
  icon: Icon;
  to: string;
  iconClassName?: string;
}) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg",
              iconClassName,
            )}
          >
            <IconCmp size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">
              {title}
            </span>
            <span className="text-2xl font-semibold text-foreground">
              {value}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const {data: customersResult} = useCustomers({limit: 1});
  const {data: materialsResult} = useMaterials({limit: 1});
  const {data: servicesResult} = useServices({limit: 1});
  const {data: vehiclesResult} = useVehicles({limit: 1});
  const {data: workersResult} = useWorkers({limit: 1});
  const {data: deliveryNotes = [], isLoading, error} = useDeliveryNotes();
  const {
    data: internalParts = [],
    isLoading: partsLoading,
    error: partsError,
  } = useInternalParts();
  const {
    data: proformas = [],
    isLoading: proformasLoading,
    error: proformasError,
  } = useProformas();

  const signed = deliveryNotes.filter(
    (d: {signed: boolean}) => d.signed,
  ).length;
  const unsigned = deliveryNotes.length - signed;
  const machinery = internalParts.filter(
    (part: {type: string}) => part.type === "MAQUINARIA",
  ).length;
  const trucks = internalParts.length - machinery;

  return (
    <div className="flex w-full flex-col gap-6">
      <TitleSegment path="/" />
      <RenderWhenLoad
        isLoading={isLoading || partsLoading || proformasLoading}
        error={error ?? partsError ?? proformasError}
      >
        <div className="flex flex-col gap-6 py-4">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Albaranes de venta
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total albaranes de venta"
                value={deliveryNotes.length}
                icon={IconFileText}
                to="/albaranes"
              />
              <StatCard
                title="Firmados"
                value={signed}
                icon={IconCircleCheck}
                to="/albaranes"
                iconClassName="bg-emerald-100 text-emerald-700"
              />
              <StatCard
                title="Pendientes de firma"
                value={unsigned}
                icon={IconClockHour4}
                to="/albaranes"
                iconClassName="bg-amber-100 text-amber-700"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Proformas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total proformas"
                value={proformas.length}
                icon={IconFileInvoice}
                to="/proformas"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Partes internos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total partes internos"
                value={internalParts.length}
                icon={IconClipboardList}
                to="/partes-internos"
              />
              <StatCard
                title="Maquinaria"
                value={machinery}
                icon={IconClipboardList}
                to="/partes-internos"
                iconClassName="bg-violet-100 text-violet-700"
              />
              <StatCard
                title="Camiones"
                value={trucks}
                icon={IconTruck}
                to="/partes-internos"
                iconClassName="bg-sky-100 text-sky-700"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Mantenimiento
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Clientes"
                value={customersResult?.total ?? 0}
                icon={IconBuilding}
                to="/mantenimiento/clientes"
              />
              <StatCard
                title="Materiales"
                value={materialsResult?.total ?? 0}
                icon={IconPackage}
                to="/mantenimiento/materiales"
              />
              <StatCard
                title="Servicios"
                value={servicesResult?.total ?? 0}
                icon={IconTool}
                to="/mantenimiento/servicios"
              />
              <StatCard
                title="Vehículos"
                value={vehiclesResult?.total ?? 0}
                icon={IconTruck}
                to="/mantenimiento/vehiculos"
              />
              <StatCard
                title="Operarios"
                value={workersResult?.total ?? 0}
                icon={IconUsers}
                to="/mantenimiento/operarios"
              />
            </div>
          </section>
        </div>
      </RenderWhenLoad>
    </div>
  );
}
