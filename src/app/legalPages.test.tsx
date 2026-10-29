import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ConfidentialitePage from "./confidentialite/page";
import MentionsLegalesPage from "./mentions-legales/page";

// Garde-fou : les mentions obligatoires ne doivent pas disparaître d'une
// réécriture des textes.
describe("pages légales", () => {
  it("la confidentialité couvre les informations exigées par le RGPD", () => {
    render(<ConfidentialitePage />);
    for (const title of [
      "Responsable du traitement",
      "Finalités et base légale",
      "Destinataires et sous-traitants",
      "Durée de conservation",
      "Cookies",
      "Vos droits",
    ]) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/CNIL/)).toBeInTheDocument();
  });

  it("les mentions légales nomment l'éditeur et l'hébergeur", () => {
    render(<MentionsLegalesPage />);
    expect(screen.getAllByText("Éditeur").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hébergement").length).toBeGreaterThan(0);
    expect(screen.getByText(/Vercel Inc\./)).toBeInTheDocument();
  });
});
