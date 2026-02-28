import { describe, expect, it } from "vitest";

import { getCatalogWhereForTests } from "@/lib/catalog";

describe("catalog where builder", () => {
  it("builds search and filters", () => {
    const where = getCatalogWhereForTests({
      q: "razer",
      category: "mice",
      brand: "razer",
      min: "50",
      max: "120",
      inStock: "true",
    });

    expect(where.OR).toBeDefined();
    expect(where.category).toEqual({ slug: "mice" });
    expect(where.brand).toEqual({ slug: "razer" });
    expect(where.priceCents).toEqual({ gte: 5000, lte: 12000 });
    expect(where.stock).toEqual({ gt: 0 });
  });

  it("ignores invalid numbers", () => {
    const where = getCatalogWhereForTests({ min: "abc", max: "10" });
    expect(where.priceCents).toEqual({ gte: undefined, lte: 1000 });
  });
});
