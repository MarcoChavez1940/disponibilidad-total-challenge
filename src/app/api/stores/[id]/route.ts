import { getStoreDetail } from "@/lib/stores";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const storeId = Number(id);
  const store = Number.isInteger(storeId) ? getStoreDetail(storeId) : null;

  if (!store) {
    return Response.json({ message: "Tienda no encontrada" }, { status: 404 });
  }

  return Response.json(store);
}
