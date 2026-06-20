import { ArrowDown, ArrowUp } from "lucide-react";
import type { SortDirection } from "@/lib/sales-dashboard-utils";

type SortableTableHeaderProps<SortKey extends string> = {
  className: string;
  isActive: boolean;
  label: string;
  sortDirection: SortDirection;
  sortKey: SortKey;
  onSort: (sortKey: SortKey) => void;
};

export function SortableTableHeader<SortKey extends string>({
  className,
  isActive,
  label,
  onSort,
  sortDirection,
  sortKey,
}: SortableTableHeaderProps<SortKey>) {
  const SortIcon = sortDirection === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className={className}>
      <button
        className="inline-flex items-center gap-2 font-semibold transition hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        onClick={() => onSort(sortKey)}
        type="button"
      >
        <span>{label}</span>
        <span
          aria-hidden="true"
          className="inline-flex h-4 w-4 items-center justify-center text-zinc-500"
        >
          {isActive ? <SortIcon className="h-4 w-4" strokeWidth={2.5} /> : null}
        </span>
        {isActive ? (
          <span className="sr-only">
            {sortDirection === "asc" ? "Orden ascendente" : "Orden descendente"}
          </span>
        ) : null}
      </button>
    </th>
  );
}
