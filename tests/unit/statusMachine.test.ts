import { describe, it, expect } from "vitest";
import {
  canTransitionOrder,
  nextOrderStatuses,
} from "@/server/statusMachine/orderStatus";
import { canTransitionPayment } from "@/server/statusMachine/paymentStatus";
import { canTransitionShipping } from "@/server/statusMachine/shippingStatus";

describe("orderStatus state machine", () => {
  it("allows pending → processing", () => {
    expect(canTransitionOrder("pending", "processing")).toBe(true);
  });

  it("allows processing → shipped (skipping packed)", () => {
    expect(canTransitionOrder("processing", "shipped")).toBe(true);
  });

  it("rejects pending → completed", () => {
    expect(canTransitionOrder("pending", "completed")).toBe(false);
  });

  it("rejects shipped → pending (no going backwards)", () => {
    expect(canTransitionOrder("shipped", "pending")).toBe(false);
  });

  it("treats same-state as allowed (idempotent)", () => {
    expect(canTransitionOrder("paid" as never, "paid" as never)).toBe(true);
    expect(canTransitionOrder("processing", "processing")).toBe(true);
  });

  it("returns no transitions for terminal states", () => {
    expect(nextOrderStatuses("completed")).toEqual([]);
    expect(nextOrderStatuses("cancelled")).toEqual([]);
    expect(nextOrderStatuses("refunded")).toEqual([]);
  });
});

describe("paymentStatus state machine", () => {
  it("allows unpaid → paid", () => {
    expect(canTransitionPayment("unpaid", "paid")).toBe(true);
  });

  it("rejects refunded → paid", () => {
    expect(canTransitionPayment("refunded", "paid")).toBe(false);
  });

  it("allows paid → refunded", () => {
    expect(canTransitionPayment("paid", "refunded")).toBe(true);
  });

  it("cancelled is terminal", () => {
    expect(canTransitionPayment("cancelled", "paid")).toBe(false);
    expect(canTransitionPayment("cancelled", "refunded")).toBe(false);
  });
});

describe("shippingStatus state machine", () => {
  it("allows the canonical happy path", () => {
    expect(canTransitionShipping("not_shipped", "preparing")).toBe(true);
    expect(canTransitionShipping("preparing", "packed")).toBe(true);
    expect(canTransitionShipping("packed", "shipped")).toBe(true);
    expect(canTransitionShipping("shipped", "in_transit")).toBe(true);
    expect(canTransitionShipping("in_transit", "delivered")).toBe(true);
  });

  it("allows delivered → returned but not back to in_transit", () => {
    expect(canTransitionShipping("delivered", "returned")).toBe(true);
    expect(canTransitionShipping("delivered", "in_transit")).toBe(false);
  });

  it("returned is terminal", () => {
    expect(canTransitionShipping("returned", "delivered")).toBe(false);
  });
});
