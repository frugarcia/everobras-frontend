import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconBuilding} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {customerSchema} from "./validations";

interface Customer {
  id: string;
  name: string;
  cif: string;
  projects: {id: string; name: string}[];
}

const columns: ColumnDef<Customer, unknown>[] = [
  {accessorKey: "name", header: "Nombre"},
  {accessorKey: "cif", header: "CIF"},
  {
    id: "projects",
    header: "Obras",
    cell: ({row}) => row.original.projects?.length ?? 0,
  },
];

function CustomerForm({item, onClose}: {item: Customer | null; onClose: () => void}) {
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      cif: item?.cif ?? "",
    },
    validators: {onSubmit: customerSchema},
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
      title={item ? "Editar cliente" : "Nuevo cliente"}
      icon={<IconBuilding size={20} className="text-primary" />}
      isPending={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      onSubmit={form.handleSubmit}
    >
        <form.Field name="name">
          {(field) => (
            <AppInput
              label="Nombre de la empresa"
              isRequired
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              {...fieldErrorProps(field)}
            />
          )}
        </form.Field>
        <form.Field name="cif">
          {(field) => (
            <AppInput
              label="CIF"
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

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useCustomers({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteCustomer();

  return (
    <CrudPage<Customer>
      path="/mantenimiento/clientes"
      addLabel="Añadir nuevo cliente"
      totalLabel="Total clientes"
      entityName="cliente"
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
      getLabel={(item) => `${item.name} (${item.cif})`}
      renderForm={(item, onClose) => <CustomerForm item={item} onClose={onClose} />}
    />
  );
}
