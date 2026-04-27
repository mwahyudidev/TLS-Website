"use client";

import { useState } from "react";
import { CheckCircle, Trash2, Loader2, Bell } from "lucide-react";
import type { AvailabilitySubscription } from "@/db/schema";

const TYPE_LABELS: Record<string, string> = {
  back_in_stock: "Back in Stock",
  new_arrival: "New Arrival",
  category_alert: "Category Alert",
  general_update: "General Update",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  notified: "bg-green-100 text-green-700",
  cancelled: "bg-muted text-muted-foreground",
};

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AvailabilitySubsTable({
  records: initial,
}: {
  records: AvailabilitySubscription[];
}) {
  const [records, setRecords] = useState(initial);
  const [busy, setBusy] = useState<number | null>(null);

  async function markNotified(id: number) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/availability-subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "notified" }),
      });
      if (!res.ok) return;
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "notified" } : r)),
      );
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this subscription request?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/availability-subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusy(null);
    }
  }

  if (records.length === 0) {
    return (
      <div className="rounded-xl border py-20 text-center text-muted-foreground">
        <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>No availability subscription requests yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Customer</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Notes</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-medium">{r.customerName}</div>
                <div className="text-xs text-muted-foreground">{r.customerEmail}</div>
                {r.customerPhone && (
                  <div className="text-xs text-muted-foreground">{r.customerPhone}</div>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {TYPE_LABELS[r.subscriptionType] ?? r.subscriptionType}
                {r.productId && (
                  <div className="text-xs">Product #{r.productId}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[r.status] ?? ""}`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                {r.notes ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatDate(r.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  {r.status === "pending" && (
                    <button
                      onClick={() => markNotified(r.id)}
                      disabled={busy === r.id}
                      title="Mark as notified"
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-green-50 text-green-600 disabled:opacity-50"
                    >
                      {busy === r.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    disabled={busy === r.id}
                    title="Delete"
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-red-50 text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
