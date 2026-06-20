import stores from "@/data/stores.json";
import type {
  Store,
  StoreDetail,
  StoreProductSale,
  StoreSummary,
} from "@/lib/types";

const storeData = stores as Store[];

const sumBy = <T>(items: T[], getValue: (item: T) => number) =>
  items.reduce((total, item) => total + getValue(item), 0);

function getStoreSummary({
  city,
  id,
  name,
  products,
  region,
}: Store): StoreSummary {
  return {
    id,
    name,
    city,
    region,
    totalSales: sumBy(products, (product) => product.totalSale),
    productsSold: sumBy(products, (product) => product.unitsSold),
  };
}

export function getStoreSummaries(): StoreSummary[] {
  return storeData.map(getStoreSummary);
}

export function getStoreDetail(id: string): StoreDetail | null {
  const store = storeData.find((item) => item.id === id);

  if (!store) {
    return null;
  }

  return {
    ...getStoreSummary(store),
    products: store.products,
  };
}

export function getStoreProductSales(): StoreProductSale[] {
  return storeData.flatMap(({ city, id, name, products, region }) =>
    products.map((product) => ({
      ...product,
      city,
      region,
      storeId: id,
      storeName: name,
    })),
  );
}
