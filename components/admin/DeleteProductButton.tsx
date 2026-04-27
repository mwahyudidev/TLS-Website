"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (
      !confirm("Archive this product? It will be hidden from the storefront.")
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handle}
      disabled={busy}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" /> Archive
    </Button>
  );
}
