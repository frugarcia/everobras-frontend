import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import CrudPage from "@/components/CrudPage";
import {
  useMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from "@/hooks/useQueries";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {materialSchema} from "./validations";
import {FieldError} from "@/components/ui/field-error";

interface Material {
  id: string;
  name: string;
}

const columns: ColumnDef<Material, unknown>[] = [
  {accessorKey: "name", header: "Nombre del material"},
];

function MaterialForm({
  item,
  onClose,
}: {
  item: Material | null;
  onClose: () => void;
}) {
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();

  const form = useForm({
    defaultValues: {name: item?.name ?? ""},
    validators: {onSubmit: materialSchema},
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
        <DialogTitle>{item ? "Editar Material" : "Nuevo Material"}</DialogTitle>
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

export default function MaterialsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading} = useMaterials({page, limit: 10, search: search || undefined});
  const deleteMutation = useDeleteMaterial();

  return (
    <CrudPage<Material>
      title="Materiales"
      description="Gestión de materiales"
      columns={columns}
      data={result?.data ?? []}
      total={result?.total ?? 0}
      page={result?.page ?? page}
      limit={result?.limit ?? 10}
      isLoading={isLoading}
      onPageChange={setPage}
      onSearchChange={(s) => { setSearch(s); setPage(1); }}
      deleteMutation={deleteMutation}
      getId={(item) => item.id}
      renderForm={(item, onClose) => (
        <MaterialForm item={item} onClose={onClose} />
      )}
    />
  );
}
