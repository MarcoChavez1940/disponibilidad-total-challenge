import { SortableTableHeader } from "@/components/sales-dashboard/sortable-table-header";
import type { ProductSale } from "@/lib/types";
import {
  currencyFormatter,
  numberFormatter,
  productColumns,
  type ProductSortKey,
  type SortDirection,
} from "@/lib/sales-dashboard-utils";

type ProductsTableProps = {
  productQuery: string;
  products: ProductSale[];
  showTopProductsOnly: boolean;
  sortDirection: SortDirection;
  sortKey: ProductSortKey;
  onProductQueryChange: (productQuery: string) => void;
  onShowTopProductsOnlyChange: (showTopProductsOnly: boolean) => void;
  onSort: (sortKey: ProductSortKey) => void;
};

export function ProductsTable({
  onProductQueryChange,
  onShowTopProductsOnlyChange,
  onSort,
  productQuery,
  products,
  showTopProductsOnly,
  sortDirection,
  sortKey,
}: ProductsTableProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-5">
      <div className="grid w-full min-w-0 max-w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-zinc-700">
          Buscar productos
          <input
            className="h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => onProductQueryChange(event.target.value)}
            placeholder="Nombre o SKU"
            type="search"
            value={productQuery}
          />
        </label>
        <label className="flex h-11 min-w-0 items-center gap-3 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700">
          <input
            checked={showTopProductsOnly}
            className="h-4 w-4 accent-emerald-700"
            onChange={(event) =>
              onShowTopProductsOnlyChange(event.target.checked)
            }
            type="checkbox"
          />
          <span className="min-w-0">Top 5 productos vendidos</span>
        </label>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-zinc-200 [contain:layout_paint]">
        <div className="min-w-[720px]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              <tr>
                {productColumns.map((column) => {
                  const isActive = column.key === sortKey;

                  return (
                    <SortableTableHeader
                      className={`px-4 py-3 ${column.align ?? ""}`}
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
              {products.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-zinc-500"
                    colSpan={5}
                  >
                    No hay productos visibles con esa búsqueda.
                  </td>
                </tr>
              ) : null}

              {products.map((product) => (
                <tr className="bg-white" key={product.sku}>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-700">
                    {product.sku}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-950">
                    {product.product}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-700">
                    {numberFormatter.format(product.unitsSold)}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-zinc-900">
                    {currencyFormatter.format(product.totalSale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
