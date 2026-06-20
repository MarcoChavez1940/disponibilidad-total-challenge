"use client";

import { useEffect, useMemo, useState } from "react";
import { ExportCsvButton } from "@/components/sales-dashboard/export-csv-button";
import { SortableTableHeader } from "@/components/sales-dashboard/sortable-table-header";
import { downloadCsv } from "@/lib/csv";
import {
  compareStoreProducts,
  currencyFormatter,
  normalize,
  numberFormatter,
  storeProductColumns,
  type LoadingState,
  type SortDirection,
  type StoreProductSortKey,
} from "@/lib/sales-dashboard-utils";
import type { StoreProductSale } from "@/lib/types";

export function AllProductsDashboard() {
  const [products, setProducts] = useState<StoreProductSale[]>([]);
  const [productsState, setProductsState] = useState<LoadingState>("idle");
  const [productQuery, setProductQuery] = useState("");
  const [sortKey, setSortKey] = useState<StoreProductSortKey>("unitsSold");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setProductsState("loading");

      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudo consultar productos");
        }

        const data = (await response.json()) as StoreProductSale[];
        setProducts(data);
        setProductsState("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setProductsState("error");
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(() => {
    const query = normalize(productQuery);

    return products
      .filter(
        (product) =>
          normalize(product.product).includes(query) ||
          normalize(product.sku).includes(query),
      )
      .sort((first, second) =>
        compareStoreProducts(first, second, sortKey, sortDirection),
      );
  }, [productQuery, products, sortDirection, sortKey]);

  function handleSort(nextSortKey: StoreProductSortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(
      nextSortKey === "totalSale" || nextSortKey === "unitsSold"
        ? "desc"
        : "asc",
    );
  }

  function handleExportProducts() {
    downloadCsv(
      "productos.csv",
      [
        "ID tienda",
        "Tienda",
        "Ciudad",
        "Región",
        "SKU",
        "Producto",
        "Categoría",
        "Unidades vendidas",
        "Venta total",
      ],
      visibleProducts.map((product) => [
        product.storeId,
        product.storeName,
        product.city,
        product.region,
        product.sku,
        product.product,
        product.category,
        product.unitsSold,
        product.totalSale,
      ]),
    );
  }

  return (
    <section className="flex w-full min-w-0 max-w-full flex-col gap-4">
      <div className="grid w-full min-w-0 max-w-full gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-zinc-700">
          Buscar productos
          <input
            className="h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            onChange={(event) => setProductQuery(event.target.value)}
            placeholder="Nombre o SKU"
            type="search"
            value={productQuery}
          />
        </label>
        <div className="flex min-w-0 items-end gap-3">
          <div className="min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Productos
            </p>
            <p className="mt-1 text-base font-semibold text-zinc-950">
              {numberFormatter.format(visibleProducts.length)}
            </p>
          </div>
          <ExportCsvButton
            ariaLabel="Exportar productos visibles en CSV"
            disabled={visibleProducts.length === 0}
            onExport={handleExportProducts}
          />
        </div>
      </div>

      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm contain-[layout_paint]">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-950">
            Productos de todas las tiendas
          </h2>
        </div>

        <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
          <div className="min-w-270">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                <tr>
                  {storeProductColumns.map((column) => (
                    <SortableTableHeader
                      className={`px-4 py-3 ${column.align ?? ""}`}
                      isActive={column.key === sortKey}
                      key={column.key}
                      label={column.label}
                      onSort={handleSort}
                      sortDirection={sortDirection}
                      sortKey={column.key}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {productsState === "loading" ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-zinc-500"
                      colSpan={8}
                    >
                      Consultando productos...
                    </td>
                  </tr>
                ) : null}

                {productsState === "error" ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-rose-700"
                      colSpan={8}
                    >
                      No fue posible cargar los productos.
                    </td>
                  </tr>
                ) : null}

                {productsState === "ready" && visibleProducts.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-zinc-500"
                      colSpan={8}
                    >
                      No hay productos visibles con esa búsqueda.
                    </td>
                  </tr>
                ) : null}

                {visibleProducts.map((product) => (
                  <tr
                    className="bg-white"
                    key={`${product.storeId}-${product.sku}`}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-950">
                      {product.storeName}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{product.city}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {product.region}
                    </td>
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
      </section>
    </section>
  );
}
