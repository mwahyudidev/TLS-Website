import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/server/lib/session";
import { listAdminRecipes } from "@/server/modules/recipes/admin";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";

export default async function AdminRecipesPage() {
  await requireAdmin();
  const recipes = await listAdminRecipes();

  return (
    <div>
      <PageHeader
        title="Recipes"
        description="Manage recipe content"
        action={
          <Link href="/admin/recipes/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Recipe
            </Button>
          </Link>
        }
      />
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Difficulty</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {recipes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No recipes yet. <Link href="/admin/recipes/new" className="text-primary underline">Create one</Link>.
                </td>
              </tr>
            ) : (
              recipes.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{r.difficulty}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "published" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.featured ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/recipes/${r.id}`} className="text-xs text-primary hover:underline">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
