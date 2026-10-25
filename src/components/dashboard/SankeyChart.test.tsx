import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SankeyChart from "./SankeyChart";
import type { Category } from "@/modules/categories/model";

const categories: Category[] = [
  { id: "1", slug: "energie", label: "Énergie", color: "#fbbf24", position: 0 },
];

describe("SankeyChart", () => {
  it("relie coût mensuel, catégories et fournisseurs, avec une version texte", () => {
    const { container } = render(
      <SankeyChart
        categories={categories}
        flows={[
          { category: "energie", provider: "EDF", monthlyCost: 89 },
          { category: "energie", provider: "Engie", monthlyCost: 38 },
          // Catégorie supprimée : retombe sur « Sans catégorie ».
          { category: "disparue", provider: "Zénith", monthlyCost: 34 },
        ]}
      />,
    );

    // 1 total + 2 catégories + 3 fournisseurs ; 2 + 3 flux.
    expect(container.querySelectorAll("rect")).toHaveLength(6);
    expect(container.querySelectorAll("path")).toHaveLength(5);
    expect(container.innerHTML).not.toContain("NaN");
    // formatEuro sépare le montant de « € » par une espace insécable.
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/161\s€/);
    expect(screen.getByText(/Énergie : 127\s€ par mois, dont EDF 89\s€, Engie 38\s€/)).toBeInTheDocument();
    expect(screen.getByText(/Sans catégorie : 34\s€ par mois/)).toBeInTheDocument();
  });
});
