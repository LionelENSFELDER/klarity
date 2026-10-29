/** Signale un plantage côté navigateur au serveur (voir api/errors). */
export function reportError(error: Error & { digest?: string }): void {
  try {
    navigator.sendBeacon(
      "/api/errors",
      JSON.stringify({ message: error.message, digest: error.digest, path: location.pathname }),
    );
  } catch {
    // Le signalement ne doit jamais aggraver la page d'erreur.
  }
}
