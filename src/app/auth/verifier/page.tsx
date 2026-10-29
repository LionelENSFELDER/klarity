import { Alert, Button, Stack } from "@mui/material";
import AuthLayout from "@/components/auth/AuthLayout";
import { verifyEmail } from "@/modules/auth/verification";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

/** Ouvert depuis le lien reçu par e-mail : active le compte. */
export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const email = token ? await verifyEmail(token) : null;

  return (
    <AuthLayout
      title={email ? "Adresse confirmée" : "Lien invalide"}
      subtitle={
        email
          ? "Votre compte est activé. Vous pouvez vous connecter."
          : "Ce lien a expiré ou a déjà servi."
      }
    >
      <Stack spacing={2.25}>
        {!email && (
          <Alert severity="info">
            Connectez-vous avec votre e-mail et votre mot de passe : si l&apos;adresse n&apos;est
            pas encore confirmée, la page de connexion propose de renvoyer un lien.
          </Alert>
        )}
        <Button href="/auth/signin" variant="contained" sx={{ minHeight: 50, fontSize: 15 }}>
          Se connecter
        </Button>
      </Stack>
    </AuthLayout>
  );
}
