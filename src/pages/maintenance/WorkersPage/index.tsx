import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import CrudPage from "@/components/CrudPage";
import {
  useWorkers,
  useCreateWorker,
  useUpdateWorker,
  useDeleteWorker,
} from "@/hooks/useQueries";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {workerSchema} from "./validations";
import {FieldError} from "@/components/ui/field-error";

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
}

const columns: ColumnDef<Worker, unknown>[] = [
  {accessorKey: "firstName", header: "Nombre"},
  {accessorKey: "lastName", header: "Apellidos"},
  {accessorKey: "dni", header: "DNI"},
  {accessorKey: "email", header: "Email"},
];

function WorkerForm({
  item,
  onClose,
}: {
  item: Worker | null;
  onClose: () => void;
}) {
  const createMutation = useCreateWorker();
  const updateMutation = useUpdateWorker();

  const form = useForm({
    defaultValues: {
      firstName: item?.firstName ?? "",
      lastName: item?.lastName ?? "",
      dni: item?.dni ?? "",
      email: item?.email ?? "",
    },
    validators: {onSubmit: workerSchema},
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
        <DialogTitle>{item ? "Editar Operario" : "Nuevo Operario"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="firstName">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>
          <form.Field name="lastName">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="dni">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>
        </div>
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

export default function WorkersPage() {
  const {data = [], isLoading} = useWorkers();
  const deleteMutation = useDeleteWorker();

  return (
    <CrudPage<Worker>
      title="Operarios"
      description="Gestión de operarios"
      columns={columns}
      data={data}
      isLoading={isLoading}
      deleteMutation={deleteMutation}
      getId={(item) => item.id}
      renderForm={(item, onClose) => (
        <WorkerForm item={item} onClose={onClose} />
      )}
    />
  );
}
