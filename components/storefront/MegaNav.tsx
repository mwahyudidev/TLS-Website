import { NavShell } from "./NavShell";
import { getCurrentUser } from "@/server/lib/session";
import { getStoreInfo } from "@/server/modules/settings/service";
import { getCartItemCount } from "@/server/modules/cart/service";
import { listActiveCategories } from "@/server/modules/categories/service";
import type { Category } from "@/db/schema";

export async function MegaNav() {
  const [user, store, cartCount, categories] = await Promise.all([
    getCurrentUser(),
    getStoreInfo(),
    getCartItemCount(),
    listActiveCategories(),
  ]);

  return (
    <NavShell
      storeName={store.name}
      cartCount={cartCount}
      isLoggedIn={!!user}
      categories={categories as Category[]}
    />
  );
}
