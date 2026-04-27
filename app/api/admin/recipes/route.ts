import { ok, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import { listAdminRecipes, createRecipe, recipeSchema } from "@/server/modules/recipes/admin";

export async function GET() {
  try {
    await requireAdmin();
    return ok(await listAdminRecipes());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const data = await parseJson(req, recipeSchema);
    return ok(await createRecipe(data));
  } catch (e) {
    return fail(e);
  }
}
