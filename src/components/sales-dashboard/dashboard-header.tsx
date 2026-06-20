import { Menu } from "lucide-react";
import { useState } from "react";
import type { StoreSummary } from "@/lib/types";
import {
  currencyFormatter,
  numberFormatter,
} from "@/lib/sales-dashboard-utils";

export type DashboardView = "products" | "stores";

type DashboardHeaderProps = {
  activeDashboard: DashboardView;
  stores: StoreSummary[];
  onDashboardChange: (dashboard: DashboardView) => void;
};

const dashboardLabels: Record<DashboardView, string> = {
  products: "Tablero de productos",
  stores: "Tablero de tiendas",
};

export function DashboardHeader({
  activeDashboard,
  onDashboardChange,
  stores,
}: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalSales = stores.reduce((total, store) => total + store.totalSales, 0);
  const totalUnits = stores.reduce(
    (total, store) => total + store.productsSold,
    0,
  );

  function handleDashboardChange(dashboard: DashboardView) {
    onDashboardChange(dashboard);
    setIsMenuOpen(false);
  }

  return (
    <header className="flex w-full min-w-0 max-w-full flex-col gap-2 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-start md:w-auto">
        <div className="relative">
          <button
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú de tableros"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-950 shadow-sm transition hover:border-emerald-600 hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
          </button>

          {isMenuOpen ? (
            <div className="absolute left-0 top-12 z-30 w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
              {(["stores", "products"] as DashboardView[]).map((dashboard) => {
                const isActive = dashboard === activeDashboard;

                return (
                  <button
                    className={`block w-full px-4 py-3 text-left text-sm font-medium transition hover:bg-zinc-50 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-zinc-700"
                    }`}
                    key={dashboard}
                    onClick={() => handleDashboardChange(dashboard)}
                    type="button"
                  >
                    {dashboardLabels[dashboard]}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {dashboardLabels[activeDashboard]}
          </p>
          <h1 className="mt-1 wrap-break-word text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Disponibilidad Total
          </h1>
        </div>
      </div>
      <div className="grid w-full min-w-0 max-w-full grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:w-auto">
        <Metric label="Tiendas" value={numberFormatter.format(stores.length)} />
        <Metric label="Ventas" value={currencyFormatter.format(totalSales)} />
        <Metric label="Unidades" value={numberFormatter.format(totalUnits)} />
      </div>
    </header>
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
