/** Message affiché quand une action serveur lève au lieu de renvoyer { error }. */
export const ACTION_FAILED =
  "L'action n'a pas abouti. Recharge la page, puis reconnecte-toi si le problème persiste.";

/** Code levé par la connexion quand les tentatives sont épuisées (voir lib/auth). */
export const TOO_MANY_ATTEMPTS = "TooManyAttempts";

/** Code levé par la connexion quand l'adresse n'est pas encore vérifiée. */
export const EMAIL_NOT_VERIFIED = "EmailNotVerified";

/** Message affiché quand une limite de tentatives est atteinte. */
export const TOO_MANY_ATTEMPTS_MESSAGE = "Trop de tentatives. Patientez un moment avant de réessayer.";
