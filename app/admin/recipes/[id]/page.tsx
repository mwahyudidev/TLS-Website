import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/lib/session";
import { getAdminRecipe } from "@/server/modules/recipes/admin";
import { AppError } from "@/server/lib/errors";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecipeForm } from "@/components/admin/RecipeForm";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  let recipe;
  try {
    recipe = await getAdminRecipe(Number(id));
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  return (
    <div>
      <PageHeader title={recipe.title} description="Edit recipe" back={{ label: "Back to recipes", href: "/admin/recipes" }} />
      <RecipeForm initial={recipe} />
    </div>
  );
}
