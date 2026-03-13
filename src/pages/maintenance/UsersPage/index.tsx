import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import CrudPage from "@/components/CrudPage";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useQueries";
import {useAuth} from "@/contexts/AuthContext";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {userSchema} from "./validations";
import {FieldError} from "@/components/ui/field-error";

interface User {
  id: string;
  email: string;
  name: string;
}

const columns: ColumnDef<User, unknown>[] = [
  {accessorKey: "name", header: "Nombre"},
  {accessorKey: "email", header: "Email"},
];

function UserForm({
  item,
  onClose,
}: {
  item: User | null;
  onClose: () => void;
}) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isEditing = !!item;

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      email: item?.email ?? "",
    },
    validators: {
      onSubmit: userSchema,
    },
    onSubmit: async ({value}) => {
      if (item) {
        await updateMutation.mutateAsync({
          id: item.id,
          data: {name: value.name, email: value.email},
        });
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
        <DialogTitle>{item ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
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
        {!isEditing && (
          <p className="text-sm text-muted-foreground">
            Se enviará un email al usuario para que establezca su contraseña.
          </p>
        )}
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

export default function UsersPage() {
  const {data = [], isLoading} = useUsers();
  const deleteMutation = useDeleteUser();
  const {user: currentUser} = useAuth();

  return (
    <CrudPage<User>
      title="Usuarios"
      description="Gestión de usuarios"
      columns={columns}
      data={data}
      isLoading={isLoading}
      deleteMutation={deleteMutation}
      getId={(item) => item.id}
      canDelete={(item) => item.id !== currentUser?.id}
      renderForm={(item, onClose) => (
        <UserForm item={item} onClose={onClose} />
      )}
    />
  );
}
