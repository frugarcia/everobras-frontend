import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import CrudPage from "@/components/CrudPage";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/useQueries";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {serviceSchema} from "./validations";
import {FieldError} from "@/components/ui/field-error";

interface Service {
  id: string;
  name: string;
}

const columns: ColumnDef<Service, unknown>[] = [
  {accessorKey: "name", header: "Nombre del servicio"},
];

function ServiceForm({
  item,
  onClose,
}: {
  item: Service | null;
  onClose: () => void;
}) {
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const form = useForm({
    defaultValues: {name: item?.name ?? ""},
    validators: {onSubmit: serviceSchema},
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
        <DialogTitle>{item ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
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

export default function ServicesPage() {
  const {data = [], isLoading} = useServices();
  const deleteMutation = useDeleteService();

  return (
    <CrudPage<Service>
      title="Servicios"
      description="Gestión de servicios"
      columns={columns}
      data={data}
      isLoading={isLoading}
      deleteMutation={deleteMutation}
      getId={(item) => item.id}
      renderForm={(item, onClose) => (
        <ServiceForm item={item} onClose={onClose} />
      )}
    />
  );
}
