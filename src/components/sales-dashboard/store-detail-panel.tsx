import type { ProductSale, StoreDetail } from "@/lib/types";
import {
  currencyFormatter,
  numberFormatter,
  type LoadingState,
  type ProductSortKey,
  type SortDirection,
} from "@/lib/sales-dashboard-utils";
import { ProductsTable } from "@/components/sales-dashboard/products-table";

type StoreDetailPanelProps = {
  detailState: LoadingState;
  productQuery: string;
  products: ProductSale[];
  selectedStore: StoreDetail | null;
  selectedStoreId: string | null;
  showTopProductsOnly: boolean;
  sortDirection: SortDirection;
  sortKey: ProductSortKey;
  onProductQueryChange: (productQuery: string) => void;
  onProductSort: (sortKey: ProductSortKey) => void;
  onShowTopProductsOnlyChange: (showTopProductsOnly: boolean) => void;
};

export function StoreDetailPanel({
  detailState,
  onProductQueryChange,
  onProductSort,
  onShowTopProductsOnlyChange,
  productQuery,
  products,
  selectedStore,
  selectedStoreId,
  showTopProductsOnly,
  sortDirection,
  sortKey,
}: StoreDetailPanelProps) {
  const detailMessage = !selectedStoreId
    ? {
        className: "text-zinc-500",
        text: "Selecciona una tienda del listado para consultar sus ventas.",
      }
    : detailState === "loading"
      ? { className: "text-zinc-500", text: "Consultando detalle..." }
      : detailState === "error"
        ? {
            className: "text-rose-700",
            text: "No fue posible cargar el detalle de la tienda.",
          }
        : null;

  return (
    <section className="min-w-0 rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-zinc-950">
          Detalle de tienda
        </h2>
      </div>

      {detailMessage ? (
        <div
          className={`flex min-h-[460px] items-center justify-center px-6 text-center ${detailMessage.className}`}
        >
          {detailMessage.text}
        </div>
      ) : null}

      {detailState === "ready" && selectedStore ? (
        <div className="flex flex-col gap-5 p-4">
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-zinc-950">
                {selectedStore.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                {selectedStore.city} · {selectedStore.region}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <PlainMetric
                label="Ventas"
                value={currencyFormatter.format(selectedStore.totalSales)}
              />
              <PlainMetric
                label="Unidades"
                value={numberFormatter.format(selectedStore.productsSold)}
              />
              <PlainMetric
                label="Productos"
                value={numberFormatter.format(selectedStore.products.length)}
              />
            </div>
          </div>

          <ProductsTable
            onProductQueryChange={onProductQueryChange}
            onShowTopProductsOnlyChange={onShowTopProductsOnlyChange}
            onSort={onProductSort}
            productQuery={productQuery}
            products={products}
            showTopProductsOnly={showTopProductsOnly}
            sortDirection={sortDirection}
            sortKey={sortKey}
          />
        </div>
      ) : null}
    </section>
  );
}

function PlainMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
