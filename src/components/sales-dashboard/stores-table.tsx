import { ArrowDown, ArrowUp } from "lucide-react";
import type { StoreSummary } from "@/lib/types";
import {
  currencyFormatter,
  numberFormatter,
  storeColumns,
  type LoadingState,
  type SortDirection,
  type StoreSortKey,
} from "@/lib/sales-dashboard-utils";

type StoresTableProps = {
  stores: StoreSummary[];
  storesState: LoadingState;
  selectedStoreId: string | null;
  sortDirection: SortDirection;
  sortKey: StoreSortKey;
  onSelectStore: (storeId: string) => void;
  onSort: (sortKey: StoreSortKey) => void;
};

export function StoresTable({
  onSelectStore,
  onSort,
  selectedStoreId,
  sortDirection,
  sortKey,
  stores,
  storesState,
}: StoresTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-zinc-950">
          Listado de tiendas
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-left text-sm sm:min-w-[640px]">
          <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <tr>
              {storeColumns.map((column) => {
                const isActive = column.key === sortKey;
                const SortIcon =
                  sortDirection === "asc" ? ArrowUp : ArrowDown;
                const isSticky = column.key === "name";

                return (
                  <th
                    className={`px-2 py-3 sm:px-4 ${column.align ?? ""} ${
                      isSticky
                        ? "sticky left-0 z-20 min-w-[140px] border-r border-zinc-200 bg-zinc-100 sm:min-w-[180px]"
                        : ""
                    }`}
                    key={column.key}
                  >
                    <button
                      className="inline-flex items-center gap-2 font-semibold transition hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      onClick={() => onSort(column.key)}
                      type="button"
                    >
                      <span>{column.label}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex h-4 w-4 items-center justify-center text-zinc-500"
                      >
                        {isActive ? (
                          <SortIcon className="h-4 w-4" strokeWidth={2.5} />
                        ) : null}
                      </span>
                      {isActive ? (
                        <span className="sr-only">
                          {sortDirection === "asc"
                            ? "Orden ascendente"
                            : "Orden descendente"}
                        </span>
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {storesState === "loading" ? (
              <tr>
                <td
                  className="px-2 py-8 text-center text-zinc-500 sm:px-4"
                  colSpan={4}
                >
                  Consultando tiendas...
                </td>
              </tr>
            ) : null}

            {storesState === "error" ? (
              <tr>
                <td
                  className="px-2 py-8 text-center text-rose-700 sm:px-4"
                  colSpan={4}
                >
                  No fue posible cargar las tiendas.
                </td>
              </tr>
            ) : null}

            {storesState === "ready" && stores.length === 0 ? (
              <tr>
                <td
                  className="px-2 py-8 text-center text-zinc-500 sm:px-4"
                  colSpan={4}
                >
                  No hay tiendas con esos filtros.
                </td>
              </tr>
            ) : null}

            {stores.map((store) => {
              const isSelected = store.id === selectedStoreId;

              return (
                <tr
                  aria-selected={isSelected}
                  className={
                    isSelected
                      ? "group cursor-pointer bg-emerald-50"
                      : "group cursor-pointer bg-white transition hover:bg-zinc-50"
                  }
                  key={store.id}
                  onClick={() => onSelectStore(store.id)}
                >
                  <td
                    className={`sticky left-0 z-10 min-w-[140px] break-words border-r border-zinc-200 px-2 py-3 sm:min-w-[180px] sm:px-4 ${
                      isSelected
                        ? "bg-emerald-50"
                        : "bg-white group-hover:bg-zinc-50"
                    }`}
                  >
                    <button
                      className="text-left font-semibold text-zinc-950 underline-offset-4 hover:text-emerald-700 hover:underline focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectStore(store.id);
                      }}
                      type="button"
                    >
                      {store.name}
                    </button>
                  </td>
                  <td className="break-words px-2 py-3 text-zinc-600 sm:px-4">
                    {store.city}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center font-medium text-zinc-900 sm:px-4">
                    {currencyFormatter.format(store.totalSales)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-zinc-700 sm:px-4">
                    {numberFormatter.format(store.productsSold)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
