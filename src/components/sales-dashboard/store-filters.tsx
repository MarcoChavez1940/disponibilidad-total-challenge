import { ChevronDown } from "lucide-react";

type StoreFiltersProps = {
  regions: string[];
  regionFilter: string;
  storeQuery: string;
  onRegionFilterChange: (regionFilter: string) => void;
  onStoreQueryChange: (storeQuery: string) => void;
};

export function StoreFilters({
  onRegionFilterChange,
  onStoreQueryChange,
  regionFilter,
  regions,
  storeQuery,
}: StoreFiltersProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px]">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Buscar por tienda
        <input
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          onChange={(event) => onStoreQueryChange(event.target.value)}
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
            onChange={(event) => onRegionFilterChange(event.target.value)}
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
  );
}
