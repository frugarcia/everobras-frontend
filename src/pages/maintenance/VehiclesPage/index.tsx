import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import CrudPage from "@/components/CrudPage";
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@/hooks/useQueries";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {vehicleSchema} from "./validations";
import {FieldError} from "@/components/ui/field-error";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
}

const columns: ColumnDef<Vehicle, unknown>[] = [
  {accessorKey: "name", header: "Nombre"},
  {accessorKey: "plate", header: "Matrícula"},
];

function VehicleForm({
  item,
  onClose,
}: {
  item: Vehicle | null;
  onClose: () => void;
}) {
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      plate: item?.plate ?? "",
    },
    validators: {onSubmit: vehicleSchema},
    onSubmit: async ({value}) => {
      if (item) {
        await updateMutation.mutateAsync({id: item.id, data: value});
      } else {
        await createMutation.mutateAsync(value);
      }
      onClose();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <DialogHeader>
        <DialogTitle>{item ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError field={field} />
            </div>
          )}
        </form.Field>
        <form.Field name="plate">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="plate">Matrícula</Label>
              <Input
                id="plate"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError field={field} />
            </div>
          )}
        </form.Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit]}>
          {([canSubmit]) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export default function VehiclesPage() {
  const {data = [], isLoading} = useVehicles();
  const deleteMutation = useDeleteVehicle();

  return (
    <CrudPage<Vehicle>
      title="Vehículos"
      description="Gestión de vehículos"
      columns={columns}
      data={data}
      isLoading={isLoading}
      deleteMutation={deleteMutation}
      getId={(item) => item.id}
      renderForm={(item, onClose) => (
        <VehicleForm item={item} onClose={onClose} />
      )}
    />
  );
}
