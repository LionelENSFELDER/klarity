import { describe, it, expect } from "vitest";
import { getContrastRatio } from "@mui/material/styles";
import { CATEGORY_PALETTE, NO_CATEGORY, categoryTint } from "./model";

describe("categoryTint", () => {
  const colors = [...CATEGORY_PALETTE, NO_CATEGORY.color];

  it.each(["light", "dark"] as const)("reste lisible en thème %s", (mode) => {
    for (const color of colors) {
      const { bg, ink } = categoryTint(color, mode);
      expect(getContrastRatio(ink, bg), color).toBeGreaterThanOrEqual(4.5);
    }
  });
});
