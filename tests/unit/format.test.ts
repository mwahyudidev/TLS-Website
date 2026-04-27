import { describe, it, expect } from "vitest";
import { formatMoney } from "@/lib/format";
import { slugify } from "@/server/lib/slug";

describe("formatMoney", () => {
  it("formats SGD by default", () => {
    const result = formatMoney(12345);
    // en-SG locale uses non-breaking space; just check structure.
    expect(result).toContain("123.45");
    expect(result).toMatch(/\$/);
  });

  it("handles zero", () => {
    expect(formatMoney(0)).toContain("0.00");
  });

  it("handles large amounts", () => {
    expect(formatMoney(1234567)).toContain("12,345.67");
  });
});

describe("slugify", () => {
  it("handles spaces and casing", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("MARINA Bay  Hoodie")).toBe("marina-bay-hoodie");
  });

  it("strips special characters", () => {
    expect(slugify("Café & Cookies!")).toBe("caf-cookies");
    expect(slugify("100% Cotton")).toBe("100-cotton");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("--leading and trailing--")).toBe("leading-and-trailing");
  });

  it("caps length", () => {
    const long = "a".repeat(200);
    expect(slugify(long).length).toBeLessThanOrEqual(80);
  });
});
