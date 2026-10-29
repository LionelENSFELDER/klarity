"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/reportError";

// Remplace le layout racine quand celui-ci plante : ni thème MUI ni providers
// ici, d'où les styles en ligne.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => reportError(error), [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100dvh", padding: 16, boxSizing: "border-box" }}>
        <main style={{ maxWidth: 460, textAlign: "center" }}>
          <h1 style={{ fontSize: 22 }}>Klarity est momentanément indisponible</h1>
          <p style={{ color: "#555", lineHeight: 1.5 }}>
            Tes données ne sont pas perdues. Réessaie dans un instant.
          </p>
          <button onClick={reset} style={{ padding: "12px 24px", borderRadius: 8, border: 0, background: "#cafea7", fontSize: 15, cursor: "pointer" }}>
            Réessayer
          </button>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#777", marginTop: 24 }}>
              Code à transmettre au support : {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
