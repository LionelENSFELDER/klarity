import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavContent from "./NavContent";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/calendar",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/components/icons/FullIconSearchSelector", () => ({
  default: () => null,
}));

function renderNav() {
  render(
    <MuiThemeProvider>
      <NavContent
        categories={[]}
        counts={{ aVenir: 0, mois: 0, tout: 0, byCategory: {}, orphans: 0, providers: [], monthTotal: 0, monthPaid: 0 }}
        user={{ name: "John Doe", email: "test@klarity.dev", image: null }}
      />
    </MuiThemeProvider>,
  );
}

describe("bascule de thème", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  // happy-dom ne signale pas de préférence sombre : le système vaut « clair ».
  it("part du thème système et bascule en sombre, puis revient", async () => {
    renderNav();
    await userEvent.click(await screen.findByRole("button", { name: "Thème sombre" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("mui-mode")).toBe("dark");

    await userEvent.click(screen.getByRole("button", { name: "Thème clair" }));
    expect(document.documentElement).toHaveClass("light");
    expect(window.localStorage.getItem("mui-mode")).toBe("light");
  });

  it("reprend le choix enregistré", async () => {
    window.localStorage.setItem("mui-mode", "dark");
    renderNav();
    expect(await screen.findByRole("button", { name: "Thème clair" })).toBeInTheDocument();
  });
});
