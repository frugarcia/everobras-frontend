import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import CrudPage from "@/components/CrudPage";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCustomers,
} from "@/hooks/useQueries";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {projectSchema} from "./validations";
import {FieldError} from "@/components/ui/field-error";

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
    cell: ({row}) => row.original.customer?.name ?? "-",
  },
];

function ProjectForm({
  item,
  onClose,
}: {
  item: Project | null;
  onClose: () => void;
}) {
  const {data: customersResult} = useCustomers({limit: 9999});
  const customers = customersResult?.data ?? [];
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      customerId: item?.customerId ?? "",
    },
    validators: {
      onSubmit: projectSchema,
    },
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
        <DialogTitle>{item ? "Editar Obra" : "Nueva Obra"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la obra</Label>
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
        <form.Field name="customerId">
          {(field) => (
            <div className="grid gap-2">
              <Label>Cliente</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c: {id: string; name: string}) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading} = useProjects({page, limit: 10, search: search || undefined});
  const deleteMutation = useDeleteProject();

  return (
    <CrudPage<Project>
      title="Obras"
      description="Gestión de obras"
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
        <ProjectForm item={item} onClose={onClose} />
      )}
    />
  );
}
