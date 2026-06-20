import type { StoreSummary } from "@/lib/types";
import {
  currencyFormatter,
  numberFormatter,
} from "@/lib/sales-dashboard-utils";

type DashboardHeaderProps = {
  stores: StoreSummary[];
};

export function DashboardHeader({ stores }: DashboardHeaderProps) {
  const totalSales = stores.reduce((total, store) => total + store.totalSales, 0);
  const totalUnits = stores.reduce(
    (total, store) => total + store.productsSold,
    0,
  );

  return (
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
        <Metric label="Tiendas" value={numberFormatter.format(stores.length)} />
        <Metric label="Ventas" value={currencyFormatter.format(totalSales)} />
        <Metric label="Unidades" value={numberFormatter.format(totalUnits)} />
      </div>
    </header>
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
