import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconUserCog} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useQueries";
import {useAuth} from "@/hooks/useAuth";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {userSchema} from "./validations";

interface User {
  id: string;
  email: string;
  name: string;
}

const columns: ColumnDef<User, unknown>[] = [
  {accessorKey: "name", header: "Nombre"},
  {accessorKey: "email", header: "Email"},
];

function UserForm({item, onClose}: {item: User | null; onClose: () => void}) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      email: item?.email ?? "",
    },
    validators: {onSubmit: userSchema},
    onSubmit: async ({value}) => {
      try {
        if (item) {
          await updateMutation.mutateAsync({id: item.id, data: value});
          toast.success("Cambios guardados");
        } else {
          await createMutation.mutateAsync(value);
          toast.success(
            "Usuario creado. Se ha enviado el correo para crear la contraseña",
          );
        }
        onClose();
      } catch (err) {
        toast.error(getErrorMessage(err, "Error al guardar el usuario"));
      }
    },
  });

  return (
    <FormModal
      title={item ? "Editar usuario" : "Nuevo usuario"}
      icon={<IconUserCog size={20} className="text-primary" />}
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
      <form.Field name="email">
        {(field) => (
          <AppInput
            label="Email"
            type="email"
            isRequired
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            {...fieldErrorProps(field)}
          />
        )}
      </form.Field>
      {!item && (
        <p className="text-sm text-muted-foreground">
          Se enviará un email al usuario para que establezca su contraseña.
        </p>
      )}
    </FormModal>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useUsers({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteUser();
  const {user: currentUser} = useAuth();

  return (
    <CrudPage<User>
      path="/mantenimiento/usuarios"
      addLabel="Añadir nuevo usuario"
      totalLabel="Total usuarios"
      entityName="usuario"
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
      getLabel={(item) => `${item.name} (${item.email})`}
      canDelete={(item) => item.id !== currentUser?.id}
      renderForm={(item, onClose) => <UserForm item={item} onClose={onClose} />}
    />
  );
}
