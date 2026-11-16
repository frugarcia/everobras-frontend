import { type RowData, type Table } from "@tanstack/react-table"
import { useCallback, useEffect } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function PaginationTable<T extends RowData>({table}: {table: Table<T>}) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = Math.ceil(
    table.getRowCount() / table.getState().pagination.pageSize
  );
  const onPageChange = useCallback(
    (page: number) => {
      return table.setPageIndex(page - 1);
    },
    [table]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const generatePageNumbers = () => {
    const pages = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  if (!totalPages || totalPages < 2) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!table.getCanPreviousPage()}
        aria-label="Página anterior"
      >
        <IconChevronLeft />
      </Button>

      {generatePageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={index}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(Number(page))}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!table.getCanNextPage()}
        aria-label="Siguiente página"
      >
        <IconChevronRight />
      </Button>
    </div>
  )
}
