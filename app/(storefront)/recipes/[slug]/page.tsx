import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChefHat, Users, ArrowLeft, Lightbulb } from "lucide-react";
import { getRecipeBySlug } from "@/server/modules/recipes/service";
import { AppError } from "@/server/lib/errors";
import { Button } from "@/components/ui/button";

const DIFFICULTY_COLOR = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let recipe;
  try {
    recipe = await getRecipeBySlug(slug);
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }

  const ingredients: string[] = recipe.ingredients ? JSON.parse(recipe.ingredients) : [];
  const instructions: string[] = recipe.instructions ? JSON.parse(recipe.instructions) : [];
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/recipes" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Recipes
        </Link>
      </nav>

      {/* Hero image */}
      {recipe.imageUrl && (
        <div className="relative aspect-[16/7] rounded-2xl overflow-hidden mb-8 shadow-sm">
          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" priority />
        </div>
      )}

      {/* Title + meta */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-3">{recipe.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${DIFFICULTY_COLOR[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
          {recipe.prepTimeMinutes && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ChefHat className="h-4 w-4" /> Prep {recipe.prepTimeMinutes} min
            </span>
          )}
          {recipe.cookTimeMinutes && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" /> Cook {recipe.cookTimeMinutes} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" /> {recipe.servings} servings
            </span>
          )}
        </div>
        {recipe.description && (
          <p className="text-muted-foreground mt-4 text-base">{recipe.description}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {instructions.length > 0 && (
          <div className="md:col-span-2">
            <h2 className="font-bold text-lg mb-4">Instructions</h2>
            <ol className="space-y-5">
              {instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>

            {recipe.tips && (
              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-sm text-amber-800 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" /> Chef's Tips
                </h3>
                <p className="text-sm text-amber-700">{recipe.tips}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl border bg-teal-50 p-6 text-center">
        <h3 className="font-bold mb-2">Ready to cook this recipe?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Order the freshest ingredients from The Line Seafood.
        </p>
        <Link href="/shop">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            Shop fresh seafood
          </Button>
        </Link>
      </div>
    </div>
  );
}
