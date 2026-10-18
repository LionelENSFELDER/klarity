import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileNav from "./MobileNav";
import type { Category } from "@/modules/categories/model";
import type { SidebarCounts } from "@/modules/contracts/sidebar";

const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/calendar",
  useSearchParams: () => searchParams,
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/components/icons/FullIconSearchSelector", () => ({
  default: () => null,
}));

const categories: Category[] = [
  { id: "1", slug: "energie", label: "Énergie", color: "#fbbf24", position: 0 },
  { id: "2", slug: "abonnement", label: "Abonnement", color: "#f472b6", position: 1 },
  { id: "3", slug: "vide", label: "Famille vide", color: "#34d399", position: 2 },
];

const counts: SidebarCounts = {
  aVenir: 17,
  mois: 9,
  tout: 10,
  byCategory: { energie: 2, abonnement: 3, vide: 0 },
  orphans: 1,
  providers: [
    { name: "EDF", count: 2, monthlyCost: 93 },
    { name: "Spotify", count: 1, monthlyCost: 11 },
  ],
};

const user = { name: "John Doe", email: "test@klarity.dev", image: null };

async function openDrawer() {
  const result = render(
    <MobileNav categories={categories} counts={counts} user={user} />,
  );
  // Le bouton est masqué au-delà de `md` ; la fenêtre de test fait 1024 px,
  // donc getByRole l'exclurait de l'arbre d'accessibilité.
  await userEvent.click(screen.getByLabelText("Ouvrir la navigation"));
  return result;
}

describe("MobileNav", () => {
  it("n'affiche rien avant ouverture", () => {
    render(<MobileNav categories={categories} counts={counts} user={user} />);
    expect(screen.queryByText("À venir")).not.toBeInTheDocument();
  });

  it("propose les trois listes avec leurs compteurs", async () => {
    await openDrawer();
    const nav = screen.getByRole("navigation");

    expect(within(nav).getByText("À venir")).toBeInTheDocument();
    expect(within(nav).getByText("Ce mois-ci")).toBeInTheDocument();
    expect(within(nav).getByText("Tout")).toBeInTheDocument();
    expect(within(nav).getByText("17")).toBeInTheDocument();
    expect(within(nav).getByText("9")).toBeInTheDocument();
  });

  it("liste les familles utilisées et masque les familles vides", async () => {
    await openDrawer();
    const nav = screen.getByRole("navigation");

    expect(within(nav).getByText("Énergie")).toBeInTheDocument();
    expect(within(nav).getByText("Abonnement")).toBeInTheDocument();
    expect(within(nav).queryByText("Famille vide")).not.toBeInTheDocument();
    // orphans > 0 : l'entrée « Sans famille » apparaît.
    expect(within(nav).getByText("Sans famille")).toBeInTheDocument();
  });

  it("liste les fournisseurs avec leur coût mensuel", async () => {
    await openDrawer();
    const nav = screen.getByRole("navigation");

    expect(within(nav).getByText("EDF")).toBeInTheDocument();
    expect(within(nav).getByText("Spotify")).toBeInTheDocument();
    expect(within(nav).getByText("93 €")).toBeInTheDocument();
  });

  it("donne accès aux réglages, au profil et à la création", async () => {
    await openDrawer();
    const nav = screen.getByRole("navigation");

    expect(within(nav).getByText("Réglages")).toBeInTheDocument();
    expect(within(nav).getByText("John Doe")).toBeInTheDocument();
    expect(within(nav).getByText("test@klarity.dev")).toBeInTheDocument();
    expect(within(nav).getByText(/Nouveau contrat/)).toBeInTheDocument();
  });

  it("pointe vers les bonnes URL filtrées", async () => {
    await openDrawer();
    const nav = screen.getByRole("navigation");

    expect(within(nav).getByText("Énergie").closest("a")).toHaveAttribute(
      "href",
      "/calendar?famille=energie",
    );
    expect(within(nav).getByText("EDF").closest("a")).toHaveAttribute(
      "href",
      "/calendar?fournisseur=EDF",
    );
  });

  it("referme le tiroir après une navigation", async () => {
    await openDrawer();
    await userEvent.click(screen.getByText("Énergie"));

    // La fermeture est animée : l'entrée disparaît du flux accessible.
    expect(await screen.findByRole("presentation")).toBeInTheDocument();
  });
});
