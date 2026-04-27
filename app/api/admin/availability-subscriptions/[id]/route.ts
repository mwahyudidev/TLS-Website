import { z } from "zod";
import { ok, noContent, fail, parseJson } from "@/server/lib/api";
import { requireAdmin } from "@/server/lib/session";
import {
  updateAvailabilitySubscription,
  deleteAvailabilitySubscription,
} from "@/server/modules/availability-subscriptions/service";

const patchSchema = z.object({
  status: z.enum(["pending", "notified", "cancelled"]).optional(),
  notes: z.string().max(500).optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await parseJson(req, patchSchema);
    const record = await updateAvailabilitySubscription(Number(id), body);
    return ok(record);
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteAvailabilitySubscription(Number(id));
    return noContent();
  } catch (e) {
    return fail(e);
  }
}
