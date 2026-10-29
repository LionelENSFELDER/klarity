// Envoi des e-mails transactionnels (vérification d'adresse, mot de passe
// oublié) par l'API HTTP de Resend : un simple fetch, pas de dépendance.
// Sans clé en développement, le message est écrit dans la console pour que
// les liens restent utilisables en local.

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

/** Adresse publique de l'app, pour construire les liens des e-mails. */
export function appUrl(path: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}

export async function sendMail(mail: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY et EMAIL_FROM sont requis pour envoyer des e-mails");
    }
    console.info(`[mail] à ${mail.to} — ${mail.subject}\n${mail.text}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: mail.to, subject: mail.subject, text: mail.text }),
  });
  if (!res.ok) {
    // Le corps de la réponse peut contenir l'adresse : on ne logue que le statut.
    throw new Error(`Envoi d'e-mail refusé par Resend (${res.status})`);
  }
}
