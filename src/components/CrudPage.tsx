import {useEffect, useRef, useState, type ReactNode} from "react";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {IconEdit, IconPlus, IconTrash} from "@tabler/icons-react";
import type {UseMutationResult} from "@tanstack/react-query";
import {toast} from "sonner";
import ButtonBordered from "@/components/ButtonBordered";
import ButtonTable from "@/components/ButtonTable";
import Modal, {ModalContent} from "@/components/Modal";
import Table from "@/components/Table";
import TitleSegment from "@/components/TitleSegment";
import {AppInput} from "@/components/ui/app-input";
import {getErrorMessage} from "@/lib/errors";
import useModalStore from "@/store/useModalStore";

interface CrudPageProps<T> {
  /** Ruta de la sección (para el título con icono). */
  path: string;
  /** Texto del botón de alta, p. ej. "Añadir nuevo cliente". */
  addLabel: string;
  /** Etiqueta del total, p. ej. "Total clientes". */
  totalLabel: string;
  /** Nombre en singular para el diálogo de borrado, p. ej. "cliente". */
  entityName: string;
  /** Si el nombre es femenino ("obra") para concordar "esta"/"este". */
  entityFeminine?: boolean;
  columns: ColumnDef<T, unknown>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error?: unknown;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  deleteMutation: UseMutationResult<unknown, Error, string>;
  renderForm: (item: T | null, onClose: () => void) => ReactNode;
  getId: (item: T) => string;
  /** Texto que identifica el registro en el diálogo de borrado. */
  getLabel: (item: T) => string;
  canDelete?: (item: T) => boolean;
}

export default function CrudPage<T>({
  path,
  addLabel,
  totalLabel,
  entityName,
  entityFeminine = false,
  columns,
  data,
  total,
  page,
  limit,
  isLoading,
  error,
  onPageChange,
  onSearchChange,
  deleteMutation,
  renderForm,
  getId,
  getLabel,
  canDelete,
}: CrudPageProps<T>) {
  const [searchInput, setSearchInput] = useState("");
  // undefined = cerrado, null = nuevo, T = editar
  const [editItem, setEditItem] = useState<T | null | undefined>(undefined);
  const handleLaunchModal = useModalStore((state) => state.handleLaunchModal);

  // Búsqueda con debounce. El callback va en un ref para que el efecto solo
  // dependa del texto (si no, cada render relanzaba la búsqueda y volvía a la página 1).
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;
  const isFirstSearch = useRef(true);
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timer = setTimeout(() => onSearchChangeRef.current(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function confirmDelete(item: T) {
    handleLaunchModal({
      title: `Eliminar ${entityName}`,
      text: `¿Está seguro que desea eliminar ${entityFeminine ? "esta" : "este"} ${entityName}?`,
      description: getLabel(item),
      subText: "Esta acción no se podrá deshacer.",
      type: "delete",
      promise: async () => {
        try {
          await deleteMutation.mutateAsync(getId(item));
          toast.success("Registro eliminado correctamente");
        } catch (err) {
          toast.error(getErrorMessage(err, "Error al eliminar el registro"));
        }
      },
    });
  }

  const allColumns: ColumnDef<T, unknown>[] = [
    {
      id: "actions",
      header: "Acciones",
      meta: {headerClassName: "w-24 text-center"},
      cell: ({row}) => (
        <div className="flex items-center justify-center gap-2">
          <ButtonTable
            tooltip="Editar"
            icon={<IconEdit size={20} className="stroke-blue-700" />}
            onClick={() => setEditItem(row.original)}
          />
          <ButtonTable
            tooltip="Eliminar"
            isDisabled={canDelete ? !canDelete(row.original) : false}
            icon={<IconTrash size={20} className="stroke-red-600" />}
            onClick={() => confirmDelete(row.original)}
          />
        </div>
      ),
    },
    ...columns,
  ];

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    manualPagination: true,
    rowCount: total,
    state: {pagination: {pageIndex: page - 1, pageSize: limit}},
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({pageIndex: page - 1, pageSize: limit})
          : updater;
      onPageChange(next.pageIndex + 1);
    },
    meta: {isLoading},
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <TitleSegment path={path} />
      <div className="flex flex-col gap-6 py-4">
        <ButtonBordered
          label={addLabel}
          color="green-600"
          onPress={() => setEditItem(null)}
          startContent={<IconPlus />}
          className="w-fit"
        />
        <AppInput
          type="text"
          label="Buscar..."
          placeholder="Introduzca el texto a buscar..."
          value={searchInput}
          onChange={(ev) => setSearchInput(ev.target.value)}
          isClearable
          onClear={() => setSearchInput("")}
        />
        {error ? (
          <p className="text-sm text-destructive">
            {getErrorMessage(error, "Error al cargar los datos")}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              {totalLabel}: {total}
            </p>
            <Table title={totalLabel} config={table} />
          </div>
        )}
      </div>

      <Modal
        isOpen={editItem !== undefined}
        onClose={() => setEditItem(undefined)}
        size="lg"
      >
        <ModalContent>
          {editItem !== undefined &&
            renderForm(editItem, () => setEditItem(undefined))}
        </ModalContent>
      </Modal>
    </div>
  );
}
