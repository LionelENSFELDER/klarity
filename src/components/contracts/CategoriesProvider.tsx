"use client";

import { createContext, useContext } from "react";
import { DEFAULT_CATEGORIES, type Category } from "@/modules/categories/model";

// Les catégories sont chargées une fois par la page serveur. Ce contexte évite
// de les faire descendre à travers chaque bouton « Nouveau contrat ».
const CategoriesContext = createContext<Category[] | null>(null);

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  );
}

/** Hors provider (tests, pages sans catégories chargées) : les sept par défaut. */
export function useCategories(): Category[] {
  return (
    useContext(CategoriesContext) ??
    DEFAULT_CATEGORIES.map((c) => ({ ...c, id: c.slug }))
  );
}
