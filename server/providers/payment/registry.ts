import type { PaymentProvider } from "./PaymentProvider";
import { ManualPaymentProvider } from "./ManualPaymentProvider";
import { BankTransferSimProvider } from "./BankTransferSimProvider";
import { CodSimProvider } from "./CodSimProvider";
import { EwalletPlaceholderProvider } from "./EwalletPlaceholderProvider";
import { errors } from "@/server/lib/errors";

const REGISTRY: PaymentProvider[] = [
  ManualPaymentProvider,
  BankTransferSimProvider,
  CodSimProvider,
  EwalletPlaceholderProvider,
  // StripePaymentProvider — added in phase 2
];

export function listPaymentProviders() {
  return REGISTRY.map((p) => ({
    id: p.id,
    displayName: p.displayName,
    description: p.description,
  }));
}

export function getPaymentProvider(id: string): PaymentProvider {
  const p = REGISTRY.find((p) => p.id === id);
  if (!p) throw errors.validation(`Unknown payment provider: ${id}`);
  return p;
}
