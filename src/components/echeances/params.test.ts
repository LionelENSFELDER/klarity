import { describe, it, expect } from "vitest";
import { DEFAULT_PARAMS, HORIZONS, hrefWith, parseParams } from "./params";

describe("HORIZONS", () => {
  // Régression : HORIZONS vivait dans un module "use client". Importée par la
  // page serveur, la valeur devenait une référence proxy et `.includes`
  // n'existait plus — la page renvoyait 500.
  it("est un vrai tableau, utilisable côté serveur", () => {
    expect(Array.isArray(HORIZONS)).toBe(true);
    expect(typeof HORIZONS.includes).toBe("function");
    expect([...HORIZONS]).toEqual([3, 6, 12]);
  });
});

describe("parseParams", () => {
  it("applique les valeurs par défaut sur une URL nue", () => {
    expect(parseParams({})).toEqual(DEFAULT_PARAMS);
  });

  it("lit une liste, une famille et un fournisseur valides", () => {
    expect(parseParams({ liste: "mois", famille: "energie" })).toMatchObject({
      liste: "mois",
      famille: "energie",
    });
    expect(parseParams({ fournisseur: "EDF" }).fournisseur).toBe("EDF");
  });

  it("ignore une liste ou une vue inconnue", () => {
    expect(parseParams({ liste: "n'importe quoi" }).liste).toBe("a-venir");
    expect(parseParams({ vue: "grille" }).vue).toBe("liste");
    expect(parseParams({ vue: "calendrier" }).vue).toBe("calendrier");
  });

  it("n'accepte qu'un horizon de la liste autorisée", () => {
    expect(parseParams({ horizon: "6" }).horizon).toBe(6);
    expect(parseParams({ horizon: "12" }).horizon).toBe(12);
    expect(parseParams({ horizon: "7" }).horizon).toBe(3);
    expect(parseParams({ horizon: "abc" }).horizon).toBe(3);
    expect(parseParams({ horizon: "-1" }).horizon).toBe(3);
  });

  it("ne garde que la première valeur d'un paramètre répété", () => {
    expect(parseParams({ famille: ["auto", "energie"] }).famille).toBe("auto");
  });

  it("traite une chaîne vide comme absente", () => {
    expect(parseParams({ famille: "", fournisseur: "" })).toMatchObject({
      famille: null,
      fournisseur: null,
    });
  });
});

describe("hrefWith", () => {
  it("omet les valeurs par défaut pour garder l'URL courte", () => {
    expect(hrefWith(DEFAULT_PARAMS, {})).toBe("/calendar");
    expect(hrefWith(DEFAULT_PARAMS, { horizon: 3 })).toBe("/calendar");
  });

  it("conserve les filtres actifs en changeant un seul paramètre", () => {
    const params = { ...DEFAULT_PARAMS, famille: "energie" };
    expect(hrefWith(params, { horizon: 12 })).toBe(
      "/calendar?famille=energie&horizon=12",
    );
    expect(hrefWith(params, { vue: "calendrier" })).toBe(
      "/calendar?famille=energie&vue=calendrier",
    );
  });

  it("encode les fournisseurs contenant des caractères spéciaux", () => {
    const href = hrefWith(DEFAULT_PARAMS, { fournisseur: "E.D.F. & Cie" });
    expect(href).toContain("fournisseur=E.D.F.+%26+Cie");
  });
});
