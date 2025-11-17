import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

type Column<T extends Record<string, unknown>> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

type SimpleTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
};

export function SimpleTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data available.",
  className,
  pagination,
}: SimpleTableProps<T>) {
  const paginatedData = pagination
    ? data.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize,
      )
    : data;

  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize)
    : 1;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "overflow-x-auto rounded-3xl border border-border/40 bg-white/90 shadow-soft",
          className,
        )}
      >
        <table className="w-full divide-y divide-border/40 text-sm">
          <thead className="bg-gradient-soft text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className={cn("px-5 py-3", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 bg-white">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-6 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="transition hover:bg-primary/5">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn("px-5 py-4 align-top text-sm text-foreground", column.className)}
                    >
                      {column.render
                        ? column.render(item)
                        : typeof column.key === "string" && column.key in item
                          ? (item[column.key as keyof T] as React.ReactNode)
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}

