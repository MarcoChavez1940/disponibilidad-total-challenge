"use client";

import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ProductSale, StoreDetail, StoreSummary } from "@/lib/types";

type LoadingState = "idle" | "loading" | "ready" | "error";
type SortDirection = "asc" | "desc";
type ProductSortKey = keyof ProductSale;
type StoreSortKey = keyof Pick<
  StoreSummary,
  "city" | "name" | "productsSold" | "totalSales"
>;

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  maximumFractionDigits: 0,
  style: "currency",
});

const numberFormatter = new Intl.NumberFormat("es-MX");

const storeColumns: Array<{
  key: StoreSortKey;
  label: string;
  align?: string;
}> = [
  { key: "name", label: "Nombre de tienda" },
  { key: "city", label: "Ciudad" },
  { key: "totalSales", label: "Ventas totales", align: "text-center" },
  { key: "productsSold", label: "Productos vendidos", align: "text-center" },
];

const productColumns: Array<{
  key: ProductSortKey;
  label: string;
  align?: string;
}> = [
  { key: "sku", label: "SKU" },
  { key: "product", label: "Producto" },
  { key: "category", label: "Categoría" },
  { key: "unitsSold", label: "Unidades vendidas", align: "text-center" },
  { key: "totalSale", label: "Venta total", align: "text-center" },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compareValues(
  firstValue: number | string,
  secondValue: number | string,
  direction: SortDirection,
) {
  const multiplier = direction === "asc" ? 1 : -1;

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return (firstValue - secondValue) * multiplier;
  }

  return (
    String(firstValue).localeCompare(String(secondValue), "es-MX", {
      numeric: true,
      sensitivity: "base",
    }) * multiplier
  );
}

function compareProducts(
  first: ProductSale,
  second: ProductSale,
  sortKey: ProductSortKey,
  direction: SortDirection,
) {
  return compareValues(first[sortKey], second[sortKey], direction);
}

function compareStores(
  first: StoreSummary,
  second: StoreSummary,
  sortKey: StoreSortKey,
  direction: SortDirection,
) {
  return compareValues(first[sortKey], second[sortKey], direction);
}

function filterStores(
  stores: StoreSummary[],
  storeQuery: string,
  regionFilter: string,
) {
  const query = normalize(storeQuery);

  return stores.filter((store) => {
    const matchesName = normalize(store.name).includes(query);
    const matchesRegion =
      regionFilter === "all" || store.region === regionFilter;

    return matchesName && matchesRegion;
  });
}

export default function SalesDashboard() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [storesState, setStoresState] = useState<LoadingState>("idle");
  const [detailState, setDetailState] = useState<LoadingState>("idle");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [selectedStore, setSelectedStore] = useState<StoreDetail | null>(null);
  const [storeQuery, setStoreQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [productQuery, setProductQuery] = useState("");
  const [storeSortKey, setStoreSortKey] = useState<StoreSortKey>("name");
  const [storeSortDirection, setStoreSortDirection] =
    useState<SortDirection>("asc");
  const [sortKey, setSortKey] = useState<ProductSortKey>("unitsSold");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showTopProductsOnly, setShowTopProductsOnly] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStores() {
      setStoresState("loading");

      try {
        const response = await fetch("/api/stores", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudo consultar tiendas");
        }

        const data = (await response.json()) as StoreSummary[];
        setStores(data);
        setStoresState("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStoresState("error");
      }
    }

    loadStores();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedStoreId) {
      return;
    }

    const controller = new AbortController();

    async function loadStoreDetail() {
      setDetailState("loading");

      try {
        const response = await fetch(`/api/stores/${selectedStoreId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudo consultar el detalle");
        }

        const data = (await response.json()) as StoreDetail;
        setSelectedStore(data);
        setProductQuery("");
        setSortKey("unitsSold");
        setSortDirection("desc");
        setShowTopProductsOnly(true);
        setDetailState("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSelectedStore(null);
        setDetailState("error");
      }
    }

    loadStoreDetail();

    return () => controller.abort();
  }, [detailRefreshKey, selectedStoreId]);

  const regions = useMemo(
    () => Array.from(new Set(stores.map((store) => store.region))).sort(),
    [stores],
  );

  const filteredStores = useMemo(() => {
    return filterStores(stores, storeQuery, regionFilter).sort((first, second) =>
      compareStores(first, second, storeSortKey, storeSortDirection),
    );
  }, [regionFilter, storeQuery, storeSortDirection, storeSortKey, stores]);

  const topProducts = useMemo(() => {
    if (!selectedStore) {
      return [];
    }

    return [...selectedStore.products]
      .sort(
        (first, second) =>
          second.unitsSold - first.unitsSold ||
          second.totalSale - first.totalSale,
      )
      .slice(0, 5);
  }, [selectedStore]);

  const visibleProducts = useMemo(() => {
    const query = normalize(productQuery);
    const products = showTopProductsOnly
      ? topProducts
      : selectedStore?.products ?? [];

    return products
      .filter(
        (product) =>
          normalize(product.product).includes(query) ||
          normalize(product.sku).includes(query),
      )
      .sort((first, second) =>
        compareProducts(first, second, sortKey, sortDirection),
      );
  }, [
    productQuery,
    selectedStore?.products,
    showTopProductsOnly,
    sortDirection,
    sortKey,
    topProducts,
  ]);

  function handleStoreSort(nextStoreSortKey: StoreSortKey) {
    if (nextStoreSortKey === storeSortKey) {
      setStoreSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setStoreSortKey(nextStoreSortKey);
    setStoreSortDirection(
      nextStoreSortKey === "productsSold" || nextStoreSortKey === "totalSales"
        ? "desc"
        : "asc",
    );
  }

  function handleProductSort(nextSortKey: ProductSortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(
      nextSortKey === "unitsSold" || nextSortKey === "totalSale"
        ? "desc"
        : "asc",
    );
  }

  function clearSelectedStore() {
    setSelectedStoreId(null);
    setSelectedStore(null);
    setDetailState("idle");
  }

  function clearSelectedStoreWhenHidden(
    nextStoreQuery: string,
    nextRegionFilter: string,
  ) {
    if (!selectedStoreId) {
      return;
    }

    const selectedStillVisible = filterStores(
      stores,
      nextStoreQuery,
      nextRegionFilter,
    ).some((store) => store.id === selectedStoreId);

    if (!selectedStillVisible) {
      clearSelectedStore();
    }
  }

  function handleStoreQueryChange(nextStoreQuery: string) {
    setStoreQuery(nextStoreQuery);
    clearSelectedStoreWhenHidden(nextStoreQuery, regionFilter);
  }

  function handleRegionFilterChange(nextRegionFilter: string) {
    setRegionFilter(nextRegionFilter);
    clearSelectedStoreWhenHidden(storeQuery, nextRegionFilter);
  }

  function handleSelectStore(storeId: string) {
    setSelectedStoreId(storeId);
    setDetailRefreshKey((current) => current + 1);
    setSelectedStore(null);
    setDetailState("loading");
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-zinc-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Desempeño de ventas
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-zinc-950 sm:text-4xl">
              Disponibilidad Total
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Metric
              label="Tiendas"
              value={numberFormatter.format(stores.length)}
            />
            <Metric
              label="Ventas"
              value={currencyFormatter.format(
                stores.reduce((total, store) => total + store.totalSales, 0),
              )}
            />
            <Metric
              label="Unidades"
              value={numberFormatter.format(
                stores.reduce((total, store) => total + store.productsSold, 0),
              )}
            />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px]">
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Buscar por tienda
                <input
                  className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) =>
                    handleStoreQueryChange(event.target.value)
                  }
                  placeholder="Nombre de tienda"
                  type="search"
                  value={storeQuery}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Región
                <span className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-md border border-zinc-300 bg-white pl-3 pr-10 text-base text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    onChange={(event) =>
                      handleRegionFilterChange(event.target.value)
                    }
                    value={regionFilter}
                  >
                    <option value="all">Todas</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-950"
                    strokeWidth={2.25}
                  />
                </span>
              </label>
            </div>

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
                        const isActive = column.key === storeSortKey;
                        const SortIcon =
                          storeSortDirection === "asc" ? ArrowUp : ArrowDown;
                        const isSticky = column.key === "name";

                        return (
                          <th
                            className={`px-2 py-3 sm:px-4 ${
                              column.align ?? ""
                            } ${
                              isSticky
                                ? "sticky left-0 z-20 min-w-[140px] border-r border-zinc-200 bg-zinc-100 sm:min-w-[180px]"
                                : ""
                            }`}
                            key={column.key}
                          >
                            <button
                              className="inline-flex items-center gap-2 font-semibold transition hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                              onClick={() => handleStoreSort(column.key)}
                              type="button"
                            >
                              <span>{column.label}</span>
                              <span
                                aria-hidden="true"
                                className="inline-flex h-4 w-4 items-center justify-center text-zinc-500"
                              >
                                {isActive ? (
                                  <SortIcon
                                    className="h-4 w-4"
                                    strokeWidth={2.5}
                                  />
                                ) : null}
                              </span>
                              {isActive ? (
                                <span className="sr-only">
                                  {storeSortDirection === "asc"
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

                    {storesState === "ready" && filteredStores.length === 0 ? (
                      <tr>
                        <td
                          className="px-2 py-8 text-center text-zinc-500 sm:px-4"
                          colSpan={4}
                        >
                          No hay tiendas con esos filtros.
                        </td>
                      </tr>
                    ) : null}

                    {filteredStores.map((store) => {
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
                          onClick={() => handleSelectStore(store.id)}
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
                                handleSelectStore(store.id);
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
          </div>

          <section className="min-w-0 rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-zinc-950">
                Detalle de tienda
              </h2>
            </div>

            {!selectedStoreId ? (
              <div className="flex min-h-[460px] items-center justify-center px-6 text-center text-zinc-500">
                Selecciona una tienda del listado para consultar sus ventas.
              </div>
            ) : null}

            {detailState === "loading" ? (
              <div className="flex min-h-[460px] items-center justify-center px-6 text-center text-zinc-500">
                Consultando detalle...
              </div>
            ) : null}

            {detailState === "error" ? (
              <div className="flex min-h-[460px] items-center justify-center px-6 text-center text-rose-700">
                No fue posible cargar el detalle de la tienda.
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
                      value={numberFormatter.format(
                        selectedStore.products.length,
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                    Buscar productos
                    <input
                      className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                      onChange={(event) => setProductQuery(event.target.value)}
                      placeholder="Nombre o SKU"
                      type="search"
                      value={productQuery}
                    />
                  </label>
                  <label className="flex h-11 items-center gap-3 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700">
                    <input
                      checked={showTopProductsOnly}
                      className="h-4 w-4 accent-emerald-700"
                      onChange={(event) =>
                        setShowTopProductsOnly(event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>Top 5 productos vendidos</span>
                  </label>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-200">
                  <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                    <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      <tr>
                        {productColumns.map((column) => {
                          const isActive = column.key === sortKey;
                          const SortIcon =
                            sortDirection === "asc" ? ArrowUp : ArrowDown;

                          return (
                            <th
                              className={`px-4 py-3 ${column.align ?? ""}`}
                              key={column.key}
                            >
                              <button
                                className="inline-flex items-center gap-2 font-semibold transition hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                onClick={() => handleProductSort(column.key)}
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
                      {visibleProducts.length === 0 ? (
                        <tr>
                          <td
                            className="px-4 py-8 text-center text-zinc-500"
                            colSpan={5}
                          >
                            No hay productos visibles con esa búsqueda.
                          </td>
                        </tr>
                      ) : null}

                      {visibleProducts.map((product) => (
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
            ) : null}
          </section>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-zinc-950">{value}</p>
    </div>
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
