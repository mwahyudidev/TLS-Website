import { z } from "zod";
import { ok, fail, parseJson } from "@/server/lib/api";
import { getShippingRates, isEasyParcelConfigured } from "@/lib/easyparcel";
import { getShippingConfig } from "@/server/modules/settings/service";

const schema = z.object({
  postalCode: z.string().min(4).max(10).trim(),
  weightKg: z.number().positive().max(30).default(1),
  cartSubtotalCents: z.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  try {
    const input = await parseJson(req, schema);
    const shipping = await getShippingConfig();

    // Free shipping shortcut — skip EP call entirely
    if (
      shipping.freeThresholdCents > 0 &&
      input.cartSubtotalCents >= shipping.freeThresholdCents
    ) {
      return ok({
        epAvailable: false,
        freeShipping: true,
        flatRateCents: 0,
        rates: [],
      });
    }

    if (!isEasyParcelConfigured()) {
      return ok({
        epAvailable: false,
        freeShipping: false,
        flatRateCents: shipping.flatRateCents,
        rates: [],
      });
    }

    const rates = await getShippingRates({
      deliverPostcode: input.postalCode,
      weightKg: input.weightKg,
      itemValueCents: input.cartSubtotalCents,
    });

    return ok({
      epAvailable: true,
      freeShipping: false,
      flatRateCents: shipping.flatRateCents,
      rates,
    });
  } catch (e) {
    return fail(e);
  }
}
