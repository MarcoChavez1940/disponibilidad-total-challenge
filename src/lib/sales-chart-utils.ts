import type { ProductSale, StoreSummary } from "@/lib/types";

export type StoreSalesChartPoint = {
  id: number;
  store: string;
  city: string;
  region: string;
  totalSales: number;
  productsSold: number;
};

export type ProductSalesChartPoint = {
  sku: string;
  product: string;
  category: string;
  unitsSold: number;
  totalSale: number;
};

export type CategorySalesChartPoint = {
  category: string;
  totalSale: number;
  unitsSold: number;
  products: number;
};

export function getStoreSalesChartData(stores: StoreSummary[]) {
  return stores
    .map((store) => ({
      id: store.id,
      store: store.name,
      city: store.city,
      region: store.region,
      totalSales: store.totalSales,
      productsSold: store.productsSold,
    }))
    .sort((first, second) => second.totalSales - first.totalSales);
}

export function getProductSalesChartData(products: ProductSale[]) {
  return [...products].sort(
    (first, second) =>
      second.totalSale - first.totalSale ||
      second.unitsSold - first.unitsSold,
  );
}

export function getCategorySalesChartData(products: ProductSale[]) {
  const categories = new Map<string, CategorySalesChartPoint>();

  products.forEach((product) => {
    const current = categories.get(product.category) ?? {
      category: product.category,
      products: 0,
      totalSale: 0,
      unitsSold: 0,
    };

    categories.set(product.category, {
      ...current,
      products: current.products + 1,
      totalSale: current.totalSale + product.totalSale,
      unitsSold: current.unitsSold + product.unitsSold,
    });
  });

  return Array.from(categories.values()).sort(
    (first, second) => second.totalSale - first.totalSale,
  );
}
