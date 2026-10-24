import Image from "next/image";
import { Stack, Typography } from "@mui/material";

/**
 * Logo de Klarity, la même image que l'icône de l'onglet. Le PNG 192 px
 * reste net en 32 px sur écran haute densité ; le SVG du dossier public
 * est d'un vert trop pâle pour se lire sur fond clair.
 */
export default function Logo({ withName = false }: { withName?: boolean }) {
  const mark = (
    <Image
      src="/android-chrome-192x192.png"
      alt={withName ? "" : "Klarity"}
      width={32}
      height={32}
      priority
      style={{ flex: "none" }}
    />
  );

  if (!withName) return mark;
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      {mark}
      <Typography sx={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
        Klarity
      </Typography>
    </Stack>
  );
}
