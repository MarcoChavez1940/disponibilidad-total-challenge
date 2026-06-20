"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getCategorySalesChartData,
  getProductSalesChartData,
  getStoreSalesChartData,
  type StoreSalesChartPoint,
} from "@/lib/sales-chart-utils";
import {
  currencyFormatter,
  numberFormatter,
  type LoadingState,
} from "@/lib/sales-dashboard-utils";
import type { StoreDetail, StoreSummary } from "@/lib/types";

type StoreChartsDashboardProps = {
  stores: StoreSummary[];
  storesState: LoadingState;
};

const chartColors = [
  "#047857",
  "#2563eb",
  "#dc2626",
  "#ca8a04",
  "#7c3aed",
  "#0891b2",
  "#4b5563",
];

export function StoreChartsDashboard({
  stores,
  storesState,
}: StoreChartsDashboardProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreDetail | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [detailState, setDetailState] = useState<LoadingState>("idle");

  const storeSalesData = useMemo(() => getStoreSalesChartData(stores), [stores]);
  const productSalesData = useMemo(
    () =>
      selectedStore ? getProductSalesChartData(selectedStore.products) : [],
    [selectedStore],
  );
  const categorySalesData = useMemo(
    () =>
      selectedStore ? getCategorySalesChartData(selectedStore.products) : [],
    [selectedStore],
  );

  useEffect(() => {
    if (!selectedStoreId) {
      return;
    }

    const controller = new AbortController();

    async function loadStoreDetail() {
      setSelectedStore(null);
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

  function handleSelectStore(storeId: number) {
    setSelectedStoreId(storeId);
    setDetailRefreshKey((current) => current + 1);
  }

  return (
    <section className="flex w-full min-w-0 max-w-full flex-col gap-6">
      <ChartCard
        description="Comparativo de ventas acumuladas por sucursal."
        title="Ventas totales por tienda"
      >
        <div className="h-80 min-w-0">
          {storesState === "loading" ? (
            <ChartMessage>Consultando tiendas...</ChartMessage>
          ) : null}

          {storesState === "error" ? (
            <ChartMessage tone="error">
              No fue posible cargar las ventas por tienda.
            </ChartMessage>
          ) : null}

          {storesState === "ready" && storeSalesData.length === 0 ? (
            <ChartMessage>No hay tiendas para graficar.</ChartMessage>
          ) : null}

          {storeSalesData.length > 0 ? (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart
                data={storeSalesData}
                margin={{ bottom: 28, left: 8, right: 8, top: 10 }}
              >
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="4 4" />
                <XAxis
                  dataKey="store"
                  height={58}
                  interval={0}
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickFormatter={shortStoreLabel}
                />
                <YAxis
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickFormatter={formatCompactCurrency}
                  width={72}
                />
                <Tooltip
                  cursor={{ fill: "#f4f4f5" }}
                  formatter={(value) =>
                    currencyFormatter.format(Number(value))
                  }
                  labelClassName="font-semibold text-zinc-950"
                />
                <Bar dataKey="totalSales" name="Ventas" radius={[6, 6, 0, 0]}>
                  {storeSalesData.map((store, index) => (
                    <Cell
                      fill={chartColors[index % chartColors.length]}
                      key={store.id}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </ChartCard>

      <section className="grid min-w-0 max-w-full gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <StoreChartsList
          onSelectStore={handleSelectStore}
          selectedStoreId={selectedStoreId}
          stores={storeSalesData}
          storesState={storesState}
        />

        <StoreDetailCharts
          categorySalesData={categorySalesData}
          detailState={detailState}
          productSalesData={productSalesData}
          selectedStore={selectedStore}
          selectedStoreId={selectedStoreId}
        />
      </section>
    </section>
  );
}

function StoreChartsList({
  onSelectStore,
  selectedStoreId,
  stores,
  storesState,
}: {
  stores: StoreSalesChartPoint[];
  storesState: LoadingState;
  selectedStoreId: number | null;
  onSelectStore: (storeId: number) => void;
}) {
  return (
    <section className="w-full min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-zinc-950">
          Tiendas para analizar
        </h2>
      </div>

      <div className="max-h-[36rem] overflow-y-auto">
        {storesState === "loading" ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            Consultando tiendas...
          </p>
        ) : null}

        {storesState === "error" ? (
          <p className="px-4 py-8 text-center text-sm text-rose-700">
            No fue posible cargar las tiendas.
          </p>
        ) : null}

        {storesState === "ready" && stores.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No hay tiendas disponibles.
          </p>
        ) : null}

        {stores.map((store) => {
          const isSelected = store.id === selectedStoreId;

          return (
            <button
              className={`block w-full border-b border-zinc-200 px-4 py-4 text-left transition last:border-b-0 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-emerald-100 ${
                isSelected ? "bg-emerald-50" : "bg-white"
              }`}
              key={store.id}
              onClick={() => onSelectStore(store.id)}
              type="button"
            >
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="wrap-break-word font-semibold text-zinc-950">
                    {store.store}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {store.city} · {store.region}
                  </p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold text-zinc-950">
                    {currencyFormatter.format(store.totalSales)}
                  </p>
                  <p className="text-zinc-500">
                    {numberFormatter.format(store.productsSold)} unidades
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StoreDetailCharts({
  categorySalesData,
  detailState,
  productSalesData,
  selectedStore,
  selectedStoreId,
}: {
  categorySalesData: ReturnType<typeof getCategorySalesChartData>;
  detailState: LoadingState;
  productSalesData: ReturnType<typeof getProductSalesChartData>;
  selectedStore: StoreDetail | null;
  selectedStoreId: number | null;
}) {
  if (!selectedStoreId) {
    return (
      <ChartCard title="Detalle de tienda">
        <ChartMessage>Selecciona una tienda para ver sus gráficas.</ChartMessage>
      </ChartCard>
    );
  }

  if (detailState === "loading") {
    return (
      <ChartCard title="Detalle de tienda">
        <ChartMessage>Consultando detalle...</ChartMessage>
      </ChartCard>
    );
  }

  if (detailState === "error") {
    return (
      <ChartCard title="Detalle de tienda">
        <ChartMessage tone="error">
          No fue posible cargar el detalle de la tienda.
        </ChartMessage>
      </ChartCard>
    );
  }

  if (!selectedStore) {
    return (
      <ChartCard title="Detalle de tienda">
        <ChartMessage>Selecciona una tienda para ver sus gráficas.</ChartMessage>
      </ChartCard>
    );
  }

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="wrap-break-word text-2xl font-semibold text-zinc-950">
              {selectedStore.name}
            </h2>
            <p className="mt-1 text-zinc-600">
              {selectedStore.city} · {selectedStore.region}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <Metric
              label="Ventas"
              value={currencyFormatter.format(selectedStore.totalSales)}
            />
            <Metric
              label="Unidades"
              value={numberFormatter.format(selectedStore.productsSold)}
            />
            <Metric
              label="Productos"
              value={numberFormatter.format(selectedStore.products.length)}
            />
          </div>
        </div>
      </section>

      <ChartCard
        description="Productos ordenados por venta total dentro de la tienda."
        title="Venta total por producto"
      >
        <div className="h-80 min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={productSalesData}
              margin={{ bottom: 12, left: 8, right: 8, top: 10 }}
            >
              <CartesianGrid stroke="#e4e4e7" strokeDasharray="4 4" />
              <XAxis
                dataKey="sku"
                tick={{ fill: "#52525b", fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: "#52525b", fontSize: 11 }}
                tickFormatter={formatCompactCurrency}
                width={72}
              />
              <Tooltip
                cursor={{ fill: "#f4f4f5" }}
                formatter={(value) => currencyFormatter.format(Number(value))}
                labelClassName="font-semibold text-zinc-950"
              />
              <Bar dataKey="totalSale" name="Venta total" radius={[6, 6, 0, 0]}>
                {productSalesData.map((product, index) => (
                  <Cell
                    fill={chartColors[index % chartColors.length]}
                    key={product.sku}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        description="Participación de ventas agrupada por categoría."
        title="Venta total por categoría"
      >
        <div className="h-80 min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart margin={{ bottom: 8, left: 8, right: 8, top: 8 }}>
              <Tooltip
                formatter={(value) => currencyFormatter.format(Number(value))}
                labelClassName="font-semibold text-zinc-950"
              />
              <Legend iconType="circle" />
              <Pie
                cx="50%"
                cy="45%"
                data={categorySalesData}
                dataKey="totalSale"
                innerRadius="46%"
                nameKey="category"
                outerRadius="72%"
                paddingAngle={2}
              >
                {categorySalesData.map((category, index) => (
                  <Cell
                    fill={chartColors[index % chartColors.length]}
                    key={category.category}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  );
}

function ChartCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="w-full min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        ) : null}
      </div>
      <div className="min-w-0 p-4">{children}</div>
    </section>
  );
}

function ChartMessage({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "error" | "muted";
}) {
  return (
    <div
      className={`flex h-full min-h-64 items-center justify-center text-center text-sm ${
        tone === "error" ? "text-rose-700" : "text-zinc-500"
      }`}
    >
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 wrap-break-word text-base font-semibold text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function formatCompactCurrency(value: number | string) {
  return new Intl.NumberFormat("es-MX", {
    compactDisplay: "short",
    currency: "MXN",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(Number(value));
}

function shortStoreLabel(value: number | string) {
  const [firstWord, secondWord] = String(value).split(" ");

  return secondWord ? `${firstWord} ${secondWord[0]}.` : firstWord;
}
