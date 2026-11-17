import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconPackage} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {
  useMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {materialSchema} from "./validations";

interface Material {
  id: string;
  name: string;
}

const columns: ColumnDef<Material, unknown>[] = [
  {accessorKey: "name", header: "Nombre del material"},
];

export function MaterialForm({
  item,
  onClose,
  onCreated,
}: {
  item: Material | null
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
    },
    validators: {onSubmit: materialSchema},
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
      title={item ? "Editar material" : "Nuevo material"}
      icon={<IconPackage size={20} className="text-primary" />}
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

export default function MaterialsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useMaterials({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteMaterial();

  return (
    <CrudPage<Material>
      path="/mantenimiento/materiales"
      addLabel="Añadir nuevo material"
      totalLabel="Total materiales"
      entityName="material"
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
      renderForm={(item, onClose) => <MaterialForm item={item} onClose={onClose} />}
    />
  );
}
