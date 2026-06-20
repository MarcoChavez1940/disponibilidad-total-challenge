export type ProductSale = {
  sku: string;
  product: string;
  category: string;
  unitsSold: number;
  totalSale: number;
};

export type Store = {
  id: number;
  name: string;
  city: string;
  region: string;
  products: ProductSale[];
};

export type StoreSummary = {
  id: number;
  name: string;
  city: string;
  region: string;
  totalSales: number;
  productsSold: number;
};

export type StoreDetail = StoreSummary & {
  products: ProductSale[];
};

export type StoreProductSale = ProductSale & {
  storeId: number;
  storeName: string;
  city: string;
  region: string;
};
