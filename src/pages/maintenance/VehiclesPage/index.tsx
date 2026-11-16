import {useState} from "react";
import {type ColumnDef} from "@tanstack/react-table";
import {useForm} from "@tanstack/react-form";
import {IconTruck} from "@tabler/icons-react";
import {toast} from "sonner";
import CrudPage from "@/components/CrudPage";
import FormModal from "@/components/FormModal";
import {AppInput} from "@/components/ui/app-input";
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@/hooks/useQueries";
import {getErrorMessage} from "@/lib/errors";
import {fieldErrorProps} from "@/lib/form";
import {vehicleSchema} from "./validations";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
}

const columns: ColumnDef<Vehicle, unknown>[] = [
  {accessorKey: "name", header: "Nombre"},
  {accessorKey: "plate", header: "Matrícula"},
];

function VehicleForm({item, onClose}: {item: Vehicle | null; onClose: () => void}) {
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();

  const form = useForm({
    defaultValues: {
      name: item?.name ?? "",
      plate: item?.plate ?? "",
    },
    validators: {onSubmit: vehicleSchema},
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
      title={item ? "Editar vehículo" : "Nuevo vehículo"}
      icon={<IconTruck size={20} className="text-primary" />}
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
        <form.Field name="plate">
          {(field) => (
            <AppInput
              label="Matrícula"
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

export default function VehiclesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const {data: result, isLoading, error} = useVehicles({
    page,
    limit: 10,
    search: search || undefined,
  });
  const deleteMutation = useDeleteVehicle();

  return (
    <CrudPage<Vehicle>
      path="/mantenimiento/vehiculos"
      addLabel="Añadir nuevo vehículo"
      totalLabel="Total vehículos"
      entityName="vehículo"
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
      getLabel={(item) => `${item.name} (${item.plate})`}
      renderForm={(item, onClose) => <VehicleForm item={item} onClose={onClose} />}
    />
  );
}
