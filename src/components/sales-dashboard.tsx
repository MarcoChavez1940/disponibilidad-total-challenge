"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductSale, StoreDetail, StoreSummary } from "@/lib/types";

type LoadingState = "idle" | "loading" | "ready" | "error";
type SortDirection = "asc" | "desc";
type SortKey = keyof ProductSale;

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  maximumFractionDigits: 0,
  style: "currency",
});

const numberFormatter = new Intl.NumberFormat("es-MX");

const productColumns: Array<{ key: SortKey; label: string; align?: string }> = [
  { key: "sku", label: "SKU" },
  { key: "product", label: "Producto" },
  { key: "category", label: "Categoría" },
  { key: "unitsSold", label: "Unidades vendidas", align: "text-right" },
  { key: "totalSale", label: "Venta total", align: "text-right" },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compareProducts(
  first: ProductSale,
  second: ProductSale,
  sortKey: SortKey,
  direction: SortDirection,
) {
  const firstValue = first[sortKey];
  const secondValue = second[sortKey];
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
  const [selectedStore, setSelectedStore] = useState<StoreDetail | null>(null);
  const [storeQuery, setStoreQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [productQuery, setProductQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("unitsSold");
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
  }, [selectedStoreId]);

  const regions = useMemo(
    () => Array.from(new Set(stores.map((store) => store.region))).sort(),
    [stores],
  );

  const filteredStores = useMemo(() => {
    return filterStores(stores, storeQuery, regionFilter);
  }, [regionFilter, storeQuery, stores]);

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

  function handleProductSort(nextSortKey: SortKey) {
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
                <select
                  className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
                      <th className="sticky left-0 z-20 min-w-[140px] border-r border-zinc-200 bg-zinc-100 px-2 py-3 sm:min-w-[180px] sm:px-4">
                        Nombre de tienda
                      </th>
                      <th className="px-2 py-3 sm:px-4">Ciudad</th>
                      <th className="px-2 py-3 text-right sm:px-4">
                        Ventas totales
                      </th>
                      <th className="px-2 py-3 text-right sm:px-4">
                        Productos vendidos
                      </th>
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
                          className={
                            isSelected
                              ? "group bg-emerald-50"
                              : "group bg-white transition hover:bg-zinc-50"
                          }
                          key={store.id}
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
                              onClick={() => handleSelectStore(store.id)}
                              type="button"
                            >
                              {store.name}
                            </button>
                          </td>
                          <td className="break-words px-2 py-3 text-zinc-600 sm:px-4">
                            {store.city}
                          </td>
                          <td className="whitespace-nowrap px-2 py-3 text-right font-medium text-zinc-900 sm:px-4">
                            {currencyFormatter.format(store.totalSales)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-3 text-right text-zinc-700 sm:px-4">
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
                          const directionLabel =
                            sortDirection === "asc" ? "asc" : "desc";

                          return (
                            <th
                              className={`px-4 py-3 ${column.align ?? ""}`}
                              key={column.key}
                            >
                              <button
                                className={`inline-flex items-center gap-2 font-semibold transition hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                                  column.align === "text-right"
                                    ? "ml-auto justify-end"
                                    : ""
                                }`}
                                onClick={() => handleProductSort(column.key)}
                                type="button"
                              >
                                <span>{column.label}</span>
                                <span className="w-8 text-xs text-zinc-500">
                                  {isActive ? directionLabel : ""}
                                </span>
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
                          <td className="px-4 py-3 text-right text-zinc-700">
                            {numberFormatter.format(product.unitsSold)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-zinc-900">
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
