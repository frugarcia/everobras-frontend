import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Package, Users, Truck, Wrench } from "lucide-react";
import { useCustomers, useMaterials, useServices, useVehicles, useWorkers, useDeliveryNotes } from "@/hooks/useQueries";

export default function Dashboard() {
  const { data: customers = [] } = useCustomers();
  const { data: materials = [] } = useMaterials();
  const { data: services = [] } = useServices();
  const { data: vehicles = [] } = useVehicles();
  const { data: workers = [] } = useWorkers();
  const { data: deliveryNotes = [], isLoading } = useDeliveryNotes();

  const signed = deliveryNotes.filter((d: { signed: boolean }) => d.signed).length;
  const unsigned = deliveryNotes.filter((d: { signed: boolean }) => !d.signed).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const cards = [
    { title: "Albaranes", value: deliveryNotes.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Clientes", value: customers.length, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Materiales", value: materials.length, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Servicios", value: services.length, icon: Wrench, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Vehículos", value: vehicles.length, icon: Truck, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Operarios", value: workers.length, icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general del sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delivery notes summary */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Albaranes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="success">Firmados</Badge>
              <span className="text-2xl font-bold">{signed}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">Pendientes</Badge>
              <span className="text-2xl font-bold">{unsigned}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
