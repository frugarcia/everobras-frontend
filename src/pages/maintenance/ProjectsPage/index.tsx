import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconFileInvoice, IconHelmet} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import LinkTable from "@/components/LinkTable";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {AppSelect} from "@/components/ui/app-select";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCustomers,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {projectSchema} from "./validations";

interface Project {
  id: string;
  name: string;
  customerId: string;
  customer: {id: string; name: string};
}

const columns: ColumnDef<Project, unknown>[] = [
  {accessorKey: "name", header: "Nombre de la obra"},
  {
    id: "customer",
    header: "Cliente",
    cell: ({row}) => row.original.customer?.name ?? "—",
  },
];

export function ProjectForm({
  item,
  onClose,
  onCreated,
}: {
  item: Project | null
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const {data: customersResult} = useCustomers({limit: 9999});
  const customerOptions = (customersResult?.data ?? []).map(
    (c: {id: string; name: string}) => ({value: c.id, label: c.name}),
  );
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      customerId: item?.customerId ?? "",
    },
    validators: {onSubmit: projectSchema},
    onSubmit: async ({value}) => {
      try {
        if (item) {
          await updateMutation.mutateAsync({id: item.id, data: value});
        } else {
          const created = await createMutation.mutateAsync(value);
          onCreated?.(created.id);
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
      title={item ? "Editar obra" : "Nueva obra"}
      icon={<IconHelmet size={20} className="text-primary" />}
      isPending={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      onSubmit={form.handleSubmit}
    >
      <form.Field name="name">
        {(field) => (
          <AppInput
            label="Nombre de la obra"
            isRequired
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            {...fieldErrorProps(field)}
          />
        )}
      </form.Field>
      <form.Field name="customerId">
        {(field) => (
          <AppSelect
            label="Cliente"
            isRequired
            placeholder="Seleccionar cliente"
            options={customerOptions}
            value={field.state.value}
            onChange={field.handleChange}
            {...fieldErrorProps(field)}
          />
        )}
      </form.Field>
    </FormModal>
  );
}

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useProjects({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteProject();

  return (
    <CrudPage<Project>
      path="/mantenimiento/obras"
      addLabel="Añadir nueva obra"
      totalLabel="Total obras"
      entityName="obra"
      entityFeminine
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
      renderForm={(item, onClose) => (
        <ProjectForm item={item} onClose={onClose} />
      )}
      renderExtraActions={(item) => (
        <LinkTable
          to={`/proformas/nuevo?obra=${item.id}`}
          tooltip="Crear proforma"
          icon={<IconFileInvoice size={20} className="stroke-violet-700" />}
        />
      )}
    />
  );
}
