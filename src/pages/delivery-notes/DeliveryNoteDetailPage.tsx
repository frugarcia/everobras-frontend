import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil } from "lucide-react";
import { useDeliveryNote } from "@/hooks/useQueries";

interface DeliveryNoteLine {
  id: string;
  material: { name: string } | null;
  service: { name: string } | null;
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
  project: { name: string; customer: { name: string } };
  worker: { firstName: string; lastName: string };
  lines: DeliveryNoteLine[];
}

export default function DeliveryNoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: note, isLoading } = useDeliveryNote(id!) as { data: DeliveryNote | undefined; isLoading: boolean };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!note) {
    return <div className="text-center text-muted-foreground py-12">Albarán no encontrado</div>;
  }

  const total = note.lines.reduce((sum, l) => sum + l.quantity * l.price, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/albaranes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Albarán #{note.internalNumber ?? "-"}
          </h1>
          <p className="text-muted-foreground mt-1">Detalle del albarán</p>
        </div>
        <Button onClick={() => navigate(`/albaranes/${id}/editar`)} className="gap-2">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Header info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Información General</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <Badge variant={note.type === "INTERNO" ? "secondary" : "outline"}>{note.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nº Interno</span>
              <span className="font-medium">{note.internalNumber ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nº Externo</span>
              <span className="font-medium">{note.externalNumber ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span className="font-medium">{new Date(note.date).toLocaleDateString("es-ES")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Firmado</span>
              <Badge variant={note.signed ? "success" : "warning"}>{note.signed ? "Sí" : "No"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Obra y Operario</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">{note.project?.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Obra</span>
              <span className="font-medium">{note.project?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operario</span>
              <span className="font-medium">{note.worker?.firstName} {note.worker?.lastName}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lines */}
      <Card>
        <CardHeader><CardTitle>Líneas del Albarán</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material / Servicio</TableHead>
                <TableHead>Tipo Unidad</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {note.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell className="font-medium">
                    {line.material?.name ?? line.service?.name ?? "-"}
                  </TableCell>
                  <TableCell>{line.unitType}</TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">{line.price.toFixed(2)} €</TableCell>
                  <TableCell className="text-right font-medium">{(line.quantity * line.price).toFixed(2)} €</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                <TableCell className="text-right font-bold text-lg">{total.toFixed(2)} €</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
