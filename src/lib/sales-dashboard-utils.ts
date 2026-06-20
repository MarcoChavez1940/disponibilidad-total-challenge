import type { ProductSale, StoreProductSale, StoreSummary } from "@/lib/types";

export type LoadingState = "idle" | "loading" | "ready" | "error";
export type SortDirection = "asc" | "desc";
export type ProductSortKey = keyof ProductSale;
export type StoreProductSortKey = keyof StoreProductSale;
export type StoreSortKey = keyof Pick<
  StoreSummary,
  "city" | "name" | "productsSold" | "totalSales"
>;

export const currencyFormatter = new Intl.NumberFormat("es-MX", {
  currency: "MXN",
  maximumFractionDigits: 0,
  style: "currency",
});

export const numberFormatter = new Intl.NumberFormat("es-MX");

export const storeColumns: Array<{
  key: StoreSortKey;
  label: string;
  align?: string;
}> = [
  { key: "name", label: "Nombre de tienda" },
  { key: "city", label: "Ciudad" },
  { key: "totalSales", label: "Ventas totales", align: "text-center" },
  { key: "productsSold", label: "Productos vendidos", align: "text-center" },
];

export const productColumns: Array<{
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

export const storeProductColumns: Array<{
  key: StoreProductSortKey;
  label: string;
  align?: string;
}> = [
  { key: "storeName", label: "Tienda" },
  { key: "city", label: "Ciudad" },
  { key: "region", label: "Región" },
  { key: "sku", label: "SKU" },
  { key: "product", label: "Producto" },
  { key: "category", label: "Categoría" },
  { key: "unitsSold", label: "Unidades vendidas", align: "text-center" },
  { key: "totalSale", label: "Venta total", align: "text-center" },
];

export function normalize(value: string) {
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

export function compareProducts(
  first: ProductSale,
  second: ProductSale,
  sortKey: ProductSortKey,
  direction: SortDirection,
) {
  return compareValues(first[sortKey], second[sortKey], direction);
}

export function compareStores(
  first: StoreSummary,
  second: StoreSummary,
  sortKey: StoreSortKey,
  direction: SortDirection,
) {
  return compareValues(first[sortKey], second[sortKey], direction);
}

export function compareStoreProducts(
  first: StoreProductSale,
  second: StoreProductSale,
  sortKey: StoreProductSortKey,
  direction: SortDirection,
) {
  return compareValues(first[sortKey], second[sortKey], direction);
}

export function filterStores(
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
