import Link from "next/link";
import Image from "next/image";
import { Clock, UtensilsCrossed } from "lucide-react";
import { PageHero } from "@/components/storefront/PageHero";
import { ScrollReveal } from "@/components/storefront/ScrollReveal";
import { listPublishedRecipes } from "@/server/modules/recipes/service";

const DIFFICULTY_COLOR = {
  easy:   "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard:   "bg-red-100 text-red-700",
};

export default async function RecipesPage() {
  const recipes = await listPublishedRecipes();

  return (
    <div>
      <PageHero
        title="Recipes & Inspiration"
        subtitle="Cook like a hawker — simple, delicious seafood recipes for the home kitchen."
        accent="navy"
        imageUrl="https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1600&q=90&auto=format&fit=crop"
        ctaLabel="Explore Recipes"
        ctaHref="#recipes"
      />

      <div className="container py-10" id="recipes">
        <ScrollReveal>
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">All Recipes</h2>
            <p className="text-muted-foreground mt-1">Cook like a hawker — simple seafood recipes for the home kitchen</p>
          </div>
        </ScrollReveal>

        {recipes.length === 0 ? (
          <ScrollReveal>
            <div className="py-24 text-center text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p>Recipes coming soon! Check back shortly.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recipes.map((r, i) => {
              const totalTime = (r.prepTimeMinutes ?? 0) + (r.cookTimeMinutes ?? 0);
              return (
                <ScrollReveal key={r.id} delay={i * 70}>
                  <Link
                    href={`/recipes/${r.slug}`}
                    className="group rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                  >
                    <div className="relative aspect-[16/9] bg-muted">
                      {r.imageUrl ? (
                        <Image
                          src={r.imageUrl}
                          alt={r.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                          <UtensilsCrossed className="h-10 w-10 text-teal-300" />
                        </div>
                      )}
                      {r.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-teal-600 text-white text-xs font-bold px-2 py-0.5">Featured</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium capitalize ${DIFFICULTY_COLOR[r.difficulty]}`}>
                          {r.difficulty}
                        </span>
                        {totalTime > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {totalTime} min
                          </span>
                        )}
                        {r.servings && (
                          <span className="text-xs text-muted-foreground">{r.servings} servings</span>
                        )}
                      </div>
                      <h2 className="font-bold text-sm group-hover:text-teal-600 transition-colors">
                        {r.title}
                      </h2>
                      {r.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
