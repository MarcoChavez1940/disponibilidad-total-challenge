"use client";

import { useEffect, useMemo, useState } from "react";
import { AllProductsDashboard } from "@/components/sales-dashboard/all-products-dashboard";
import { DashboardHeader } from "@/components/sales-dashboard/dashboard-header";
import type { DashboardView } from "@/components/sales-dashboard/dashboard-header";
import { StoreDetailPanel } from "@/components/sales-dashboard/store-detail-panel";
import { StoreFilters } from "@/components/sales-dashboard/store-filters";
import { StoresTable } from "@/components/sales-dashboard/stores-table";
import {
  compareProducts,
  compareStores,
  filterStores,
  normalize,
  type LoadingState,
  type ProductSortKey,
  type SortDirection,
  type StoreSortKey,
} from "@/lib/sales-dashboard-utils";
import type { StoreDetail, StoreSummary } from "@/lib/types";

export default function SalesDashboard() {
  const [activeDashboard, setActiveDashboard] =
    useState<DashboardView>("stores");
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
  const [productSortKey, setProductSortKey] =
    useState<ProductSortKey>("unitsSold");
  const [productSortDirection, setProductSortDirection] =
    useState<SortDirection>("desc");
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
        setProductSortKey("unitsSold");
        setProductSortDirection("desc");
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
        compareProducts(
          first,
          second,
          productSortKey,
          productSortDirection,
        ),
      );
  }, [
    productQuery,
    productSortDirection,
    productSortKey,
    selectedStore?.products,
    showTopProductsOnly,
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
    if (nextSortKey === productSortKey) {
      setProductSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setProductSortKey(nextSortKey);
    setProductSortDirection(
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
    <main className="min-h-screen min-w-0 overflow-x-hidden overscroll-x-none bg-[#f6f7fb] text-zinc-950">
      <section className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader
          activeDashboard={activeDashboard}
          onDashboardChange={setActiveDashboard}
          stores={stores}
        />

        {activeDashboard === "stores" ? (
          <section className="grid min-w-0 max-w-full gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
            <div className="flex w-full min-w-0 max-w-full flex-col gap-4">
              <StoreFilters
                onRegionFilterChange={handleRegionFilterChange}
                onStoreQueryChange={handleStoreQueryChange}
                regionFilter={regionFilter}
                regions={regions}
                storeQuery={storeQuery}
              />

              <StoresTable
                onSelectStore={handleSelectStore}
                onSort={handleStoreSort}
                selectedStoreId={selectedStoreId}
                sortDirection={storeSortDirection}
                sortKey={storeSortKey}
                stores={filteredStores}
                storesState={storesState}
              />
            </div>

            <StoreDetailPanel
              detailState={detailState}
              onProductQueryChange={setProductQuery}
              onProductSort={handleProductSort}
              onShowTopProductsOnlyChange={setShowTopProductsOnly}
              productQuery={productQuery}
              products={visibleProducts}
              selectedStore={selectedStore}
              selectedStoreId={selectedStoreId}
              showTopProductsOnly={showTopProductsOnly}
              sortDirection={productSortDirection}
              sortKey={productSortKey}
            />
          </section>
        ) : (
          <AllProductsDashboard />
        )}
      </section>
    </main>
  );
}
