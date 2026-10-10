import { getStoreProducts } from "@/lib/storefront";
import { ProductsContent } from "./products-content";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  return <ProductsContent products={await getStoreProducts()} />;
}
