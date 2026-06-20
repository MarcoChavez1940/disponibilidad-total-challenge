import { getStoreProductSales } from "@/lib/stores";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getStoreProductSales());
}
