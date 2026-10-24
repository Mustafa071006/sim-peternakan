import { cn } from "../../utils/cn";
import { EmptyState } from "./States";
import { Skeleton } from "./Skeleton";

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * Column: {
 *   key, header, align?, width?, headerClassName?, cellClassName?,
 *   render?: (row, index) => ReactNode
 * }
 */
export function DataTable({
  columns,
  rows,
  rowKey = (row, i) => row.id ?? i,
  loading = false,
  skeletonRows = 6,
  empty,
  footer,
  className,
}) {
  return (
    <div className={cn("scrollbar-slim -mx-1 overflow-x-auto px-1", className)}>
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-faint",
                  alignClass[col.align] || "text-left",
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, r) => (
              <tr key={r} className="border-b border-line/70">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-3.5">
                    <Skeleton className="h-3.5 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-2">
                {empty || <EmptyState />}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                className="border-b border-line/70 transition-colors duration-150 animate-[sp-fade-in_0.18s_ease-out] last:border-0 hover:bg-canvas/60"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-3.5 text-[13px] text-ink/90",
                      alignClass[col.align] || "text-left",
                      col.cellClassName,
                    )}
                  >
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {footer && !loading && rows.length > 0 ? (
          <tfoot>
            <tr className="border-t-2 border-line bg-canvas/50 font-semibold text-ink">
              {footer}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
