import { requireAdmin } from "@/server/lib/session";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecipeForm } from "@/components/admin/RecipeForm";

export default async function NewRecipePage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader title="New Recipe" description="Add a seafood recipe" back={{ label: "Back to recipes", href: "/admin/recipes" }} />
      <RecipeForm />
    </div>
  );
}
