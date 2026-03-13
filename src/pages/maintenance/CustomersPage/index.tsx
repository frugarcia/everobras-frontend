import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import CrudPage from "@/components/CrudPage";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/useQueries";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {customerSchema} from "./validations";
import {FieldError} from "@/components/ui/field-error";

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
    cell: ({row}) => (
      <span className="text-muted-foreground">
        {row.original.projects?.length ?? 0}
      </span>
    ),
  },
];

function CustomerForm({
  item,
  onClose,
}: {
  item: Customer | null;
  onClose: () => void;
}) {
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      cif: item?.cif ?? "",
    },
    validators: {
      onSubmit: customerSchema,
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
        <DialogTitle>{item ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <form.Field name="name">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la empresa</Label>
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
        <form.Field name="cif">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor="cif">CIF</Label>
              <Input
                id="cif"
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

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading} = useCustomers({page, limit: 10, search: search || undefined});
  const deleteMutation = useDeleteCustomer();

  return (
    <CrudPage<Customer>
      title="Clientes"
      description="Gestión de clientes"
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
        <CustomerForm item={item} onClose={onClose} />
      )}
    />
  );
}
