import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconTool} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {serviceSchema} from "./validations";

interface Service {
  id: string;
  name: string;
}

const columns: ColumnDef<Service, unknown>[] = [
  {accessorKey: "name", header: "Nombre del servicio"},
];

function ServiceForm({item, onClose}: {item: Service | null; onClose: () => void}) {
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
    },
    validators: {onSubmit: serviceSchema},
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
      title={item ? "Editar servicio" : "Nuevo servicio"}
      icon={<IconTool size={20} className="text-primary" />}
      isPending={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      onSubmit={form.handleSubmit}
    >
        <form.Field name="name">
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
    </FormModal>
  );
}

export default function ServicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useServices({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteService();

  return (
    <CrudPage<Service>
      path="/mantenimiento/servicios"
      addLabel="Añadir nuevo servicio"
      totalLabel="Total servicios"
      entityName="servicio"
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
      getLabel={(item) => item.name}
      renderForm={(item, onClose) => <ServiceForm item={item} onClose={onClose} />}
    />
  );
}
