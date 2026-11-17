import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconBuildingStore} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {supplierSchema} from "./validations";

interface Supplier {
  id: string;
  commercialName: string;
  legalName: string;
  cif: string;
}

const columns: ColumnDef<Supplier, unknown>[] = [
  {accessorKey: "commercialName", header: "Nombre comercial"},
  {accessorKey: "legalName", header: "Razón social"},
  {accessorKey: "cif", header: "CIF"},
];

export function SupplierForm({
  item,
  onClose,
  onCreated,
}: {
  item: Supplier | null
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const form = useForm({
    defaultValues: {
      commercialName: item?.commercialName ?? "",
      legalName: item?.legalName ?? "",
      cif: item?.cif ?? "",
    },
    validators: {onSubmit: supplierSchema},
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
      title={item ? "Editar proveedor" : "Nuevo proveedor"}
      icon={<IconBuildingStore size={20} className="text-primary" />}
      isPending={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      onSubmit={form.handleSubmit}
    >
      <form.Field name="commercialName">
        {(field) => (
          <AppInput
            label="Nombre comercial"
            isRequired
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            {...fieldErrorProps(field)}
          />
        )}
      </form.Field>
      <form.Field name="legalName">
        {(field) => (
          <AppInput
            label="Razón social"
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

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useSuppliers({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteSupplier();

  return (
    <CrudPage<Supplier>
      path="/mantenimiento/proveedores"
      addLabel="Añadir nuevo proveedor"
      totalLabel="Total proveedores"
      entityName="proveedor"
      columns={columns}
      data={result?.data ?? []}
      total={result?.total ?? 0}
      page={result?.page ?? page}
      limit={result?.limit ?? 10}
      isLoading={isLoading}
      error={error}
      onPageChange={setPage}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      deleteMutation={deleteMutation}
      getId={(item) => item.id}
      getLabel={(item) => `${item.commercialName} (${item.cif})`}
      renderForm={(item, onClose) => (
        <SupplierForm item={item} onClose={onClose} />
      )}
    />
  );
}
