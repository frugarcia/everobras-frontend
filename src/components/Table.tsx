import { cn } from "@/lib/utils"
import {
  flexRender,
  type HeaderGroup,
  type Row,
  type RowData,
  type Table as TanstackTable,
} from "@tanstack/react-table"
import { IconDatabaseOff } from "@tabler/icons-react"
import PaginationTable from "./PaginationTable"
import { Spinner } from "@/components/ui/spinner"
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TTableProps<T extends RowData> = {
  title: string
  config: TanstackTable<T>
  className?: string
  removeWrapper?: boolean
}

function EmptyContent() {
  return (
    <div className="flex h-full items-center justify-center py-10">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          <IconDatabaseOff size={24} stroke={1.5} />
        </div>
        <div className="font-medium text-muted-foreground">No hay datos para mostrar</div>
      </div>
    </div>
  )
}

export default function Table<T extends RowData>({ config, title }: TTableProps<T>) {
  const sorting = config.getState().sorting[0]
  const rows = config.getRowModel().rows
  const isLoading = config.options.meta?.isLoading

  function toggleSort(columnId: string, canSort: boolean) {
    if (!canSort) return
    const desc = sorting?.id === columnId ? !sorting.desc : false
    config.setSorting([{ id: columnId, desc }])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-full min-w-0 overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
            <Spinner className="size-7" />
          </div>
        ) : null}
        <UiTable aria-label={title}>
          <TableHeader className="sticky top-0 z-10 bg-linear-to-r from-main-blue to-blue-700 text-white shadow-md">
            {config.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "bg-transparent text-white",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none hover:bg-white/10",
                      header.column.columnDef.meta?.headerClassName,
                    )}
                    onClick={() =>
                      toggleSort(header.column.id, header.column.getCanSort())
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={config.getVisibleLeafColumns().length}>
                  <EmptyContent />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row: Row<T>) => (
                <TableRow key={row.id} className="hover:bg-muted/60">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "border-b border-border text-xs md:text-sm",
                        cell.column.columnDef.meta?.rowClassName,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </UiTable>
      </div>
      <div className="flex justify-end">
        <PaginationTable table={config} />
      </div>
    </div>
  )
}
