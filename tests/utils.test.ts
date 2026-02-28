import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats cents as USD", () => {
    expect(formatPrice(12999)).toBe("$129.99");
  });
});
