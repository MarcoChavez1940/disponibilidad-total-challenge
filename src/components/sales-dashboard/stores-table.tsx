import { SortableTableHeader } from "@/components/sales-dashboard/sortable-table-header";
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
  selectedStoreId: number | null;
  sortDirection: SortDirection;
  sortKey: StoreSortKey;
  onSelectStore: (storeId: number) => void;
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
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm contain-[layout_paint]">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-zinc-950">
          Listado de tiendas
        </h2>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full border-separate border-spacing-0 text-left text-sm sm:min-w-160">
          <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <tr>
              {storeColumns.map((column) => {
                const isActive = column.key === sortKey;
                const isSticky = column.key === "name";

                return (
                  <SortableTableHeader
                    className={`px-2 py-3 sm:px-4 ${column.align ?? ""} ${
                      isSticky
                        ? "sticky left-0 z-20 min-w-35 border-r border-zinc-200 bg-zinc-100 sm:min-w-45"
                        : ""
                    }`}
                    isActive={isActive}
                    key={column.key}
                    label={column.label}
                    onSort={onSort}
                    sortDirection={sortDirection}
                    sortKey={column.key}
                  />
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
                    className={`sticky left-0 z-10 min-w-35 wrap-break-word border-r border-zinc-200 px-2 py-3 sm:min-w-45 sm:px-4 ${
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
                  <td className="wrap-break-word px-2 py-3 text-zinc-600 sm:px-4">
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
