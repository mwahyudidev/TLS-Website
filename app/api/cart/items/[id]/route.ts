import { ok, fail, parseJson, noContent } from "@/server/lib/api";
import { updateItemQuantity, removeItem } from "@/server/modules/cart/service";
import { updateItemSchema } from "@/server/modules/cart/validators";
import { errors } from "@/server/lib/errors";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const itemId = Number(id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw errors.validation("Invalid item id");
    }
    const input = await parseJson(req, updateItemSchema);
    return ok(await updateItemQuantity(itemId, input.quantity));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const itemId = Number(id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw errors.validation("Invalid item id");
    }
    await removeItem(itemId);
    return noContent();
  } catch (e) {
    return fail(e);
  }
}
