"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MergeProviders, RenameProvider } from "@/modules/categories/actions";
import { normalizeName } from "@/modules/categories/model";
import { formatEuro } from "@/modules/contracts/calendar";

export interface ProviderUsage {
  name: string;
  count: number;
  monthlyCost: number;
}

export default function ProviderSettings({
  providers,
}: {
  providers: ProviderUsage[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [merging, setMerging] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useState("");

  const reset = () => {
    setEditing(null);
    setMerging(null);
    setDraft("");
    setError("");
  };

  const run = (fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const result = await fn();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      reset();
      router.refresh();
    });
  };

  // La saisie libre produit des variantes du même fournisseur : on les
  // repère en ignorant casse, accents et ponctuation.
  const duplicates = new Map<string, string[]>();
  for (const p of providers) {
    const key = normalizeName(p.name);
    duplicates.set(key, [...(duplicates.get(key) ?? []), p.name]);
  }
  const suspicious = [...duplicates.values()].filter((g) => g.length > 1);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {suspicious.map((group) => (
        <Alert
          key={group.join("|")}
          severity="warning"
          sx={{ mb: 1.5 }}
          action={
            <Button
              size="small"
              color="inherit"
              disabled={pending}
              onClick={() => run(() => MergeProviders(group[1], group[0]))}
            >
              Fusionner
            </Button>
          }
        >
          <strong>Doublon probable.</strong>{" "}
          {group.map((g) => `« ${g} »`).join(" et ")} ne diffèrent que par la
          casse ou la ponctuation.
        </Alert>
      ))}

      <Stack sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 4.5, overflow: "hidden", px: 1 }}>
        {providers.map((p) => {
          if (editing === p.name) {
            return (
              <Paper key={p.name} variant="outlined" sx={{ p: 2, my: 1, borderRadius: 3 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <TextField
                    size="small"
                    fullWidth
                    autoFocus
                    label="Nom du fournisseur"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        run(() => RenameProvider(p.name, draft));
                    }}
                  />
                  <Button
                    variant="contained"
                    disabled={pending || !draft.trim()}
                    onClick={() => run(() => RenameProvider(p.name, draft))}
                  >
                    Enregistrer
                  </Button>
                  <Button color="inherit" onClick={reset}>
                    Annuler
                  </Button>
                </Stack>
              </Paper>
            );
          }

          return (
            <Box key={p.name}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  py: 1.25,
                  px: 1,
                  borderRadius: 1.5,
                  "& + &": { borderTop: 1, borderColor: "divider" },
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    border: 1, borderColor: "text.secondary",
                    flex: "none",
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    title={p.name}
                    sx={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: "1px" }}>
                    {p.count} contrat{p.count > 1 ? "s" : ""}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "text.secondary",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatEuro(Math.round(p.monthlyCost))}/mois
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setEditing(p.name);
                      setDraft(p.name);
                      setMerging(null);
                    }}
                  >
                    Renommer
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    disabled={providers.length < 2}
                    onClick={() => {
                      setMerging(p.name);
                      setEditing(null);
                      setTarget(providers.find((x) => x.name !== p.name)?.name ?? "");
                    }}
                  >
                    Fusionner
                  </Button>
                </Stack>
              </Stack>

              {merging === p.name && (
                <Paper variant="outlined" sx={{ p: 2, my: 1, borderRadius: 3 }}>
                  <Typography
                    sx={{ fontWeight: 600, fontSize: 13.5, mb: 0.75 }}
                  >
                    Fusionner «&nbsp;{p.name}&nbsp;» dans un autre fournisseur
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
                    Les {p.count} contrat{p.count > 1 ? "s" : ""} de «&nbsp;
                    {p.name}&nbsp;» seront repointés. Le nom de destination est
                    conservé.
                  </Typography>
                  <TextField
                    select
                    size="small"
                    label="Fournisseur de destination"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    sx={{ minWidth: 280, mb: 1.5 }}
                  >
                    {providers
                      .filter((x) => x.name !== p.name)
                      .map((x) => (
                        <MenuItem key={x.name} value={x.name}>
                          {x.name}
                        </MenuItem>
                      ))}
                  </TextField>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      disabled={pending || !target}
                      onClick={() => run(() => MergeProviders(p.name, target))}
                    >
                      Fusionner
                    </Button>
                    <Button color="inherit" onClick={reset}>
                      Annuler
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Box>
          );
        })}
      </Stack>

      <Alert severity="info" sx={{ mt: 2.25 }}>
        La liste des fournisseurs se déduit des contrats : il n&apos;y a rien à
        créer ici. Un fournisseur disparaît de lui-même quand plus aucun contrat
        ne le porte.
      </Alert>
    </Box>
  );
}
