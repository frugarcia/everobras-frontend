import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconUsers} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {
  useWorkers,
  useCreateWorker,
  useUpdateWorker,
  useDeleteWorker,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {workerSchema} from "./validations";

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

function WorkerForm({item, onClose}: {item: Worker | null; onClose: () => void}) {
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
      try {
        if (item) {
          await updateMutation.mutateAsync({id: item.id, data: value});
        } else {
          await createMutation.mutateAsync(value);
        }
        toast.success(item ? "Cambios guardados" : "Registro creado correctamente");
        onClose();
      } catch (err) {
        toast.error(getErrorMessage(err, "Error al guardar el registro"));
      }
    },
  });

  return (
    <FormModal
      title={item ? "Editar operario" : "Nuevo operario"}
      icon={<IconUsers size={20} className="text-primary" />}
      isPending={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      onSubmit={form.handleSubmit}
    >
        <form.Field name="firstName">
          {(field) => (
            <AppInput
              label="Nombre"
              isRequired
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              {...fieldErrorProps(field)}
            />
          )}
        </form.Field>
        <form.Field name="lastName">
          {(field) => (
            <AppInput
              label="Apellidos"
              isRequired
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              {...fieldErrorProps(field)}
            />
          )}
        </form.Field>
        <form.Field name="dni">
          {(field) => (
            <AppInput
              label="DNI"
              isRequired
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              {...fieldErrorProps(field)}
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <AppInput
              label="Email" type="email"
              isRequired
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              {...fieldErrorProps(field)}
            />
          )}
        </form.Field>
    </FormModal>
  );
}

export default function WorkersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useWorkers({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteWorker();

  return (
    <CrudPage<Worker>
      path="/mantenimiento/operarios"
      addLabel="Añadir nuevo operario"
      totalLabel="Total operarios"
      entityName="operario"
      columns={columns}
      data={result?.data ?? []}
      total={result?.total ?? 0}
      page={result?.page ?? page}
      limit={result?.limit ?? 10}
      isLoading={isLoading}
      error={error}
      onPageChange={setPage}
      onSearchChange={(s) => {
        setSearch(s);
        setPage(1);
      }}
      deleteMutation={deleteMutation}
      getId={(item) => item.id}
      getLabel={(item) => `${item.firstName} ${item.lastName}`}
      renderForm={(item, onClose) => <WorkerForm item={item} onClose={onClose} />}
    />
  );
}
