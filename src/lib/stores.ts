import stores from "@/data/stores.json";
import type { Store, StoreDetail, StoreSummary } from "@/lib/types";

const storeData = stores as Store[];

const sumBy = <T>(items: T[], getValue: (item: T) => number) =>
  items.reduce((total, item) => total + getValue(item), 0);

export function getStoreSummaries(): StoreSummary[] {
  return storeData.map(({ id, name, city, region, products }) => ({
    id,
    name,
    city,
    region,
    totalSales: sumBy(products, (product) => product.totalSale),
    productsSold: sumBy(products, (product) => product.unitsSold),
  }));
}

export function getStoreDetail(id: string): StoreDetail | null {
  const store = storeData.find((item) => item.id === id);

  if (!store) {
    return null;
  }

  const [summary] = getStoreSummaries().filter((item) => item.id === id);

  return {
    ...summary,
    products: store.products,
  };
}
