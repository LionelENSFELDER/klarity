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
import {
  CreateCategory,
  DeleteCategory,
  RecolorCategory,
  RenameCategory,
} from "@/modules/categories/actions";
import {
  CATEGORY_PALETTE,
  NO_CATEGORY,
  type Category,
} from "@/modules/categories/model";
import { formatEuro } from "@/modules/contracts/calendar";

interface CategorySettingsProps {
  categories: Category[];
  /** Nombre de contrats et coût mensuel par slug. */
  usage: Record<string, { count: number; monthlyCost: number }>;
}

export default function CategorySettings({
  categories,
  usage,
}: CategorySettingsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [reassign, setReassign] = useState(NO_CATEGORY.slug);

  const reset = () => {
    setEditing(null);
    setDeleting(null);
    setAdding(false);
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

  // La couleur n'identifie pas une famille, mais deux teintes identiques
  // rendent les pastilles du rail indistinguables : on avertit sans bloquer.
  const duplicateColors = categories.filter(
    (c, i) => categories.findIndex((x) => x.color === c.color) !== i,
  );

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {duplicateColors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          <strong>Couleur en double.</strong>{" "}
          {duplicateColors.map((c) => c.label).join(", ")} partage
          {duplicateColors.length > 1 ? "nt" : ""} sa teinte avec une autre
          famille. Les pastilles du rail deviennent difficiles à distinguer.
        </Alert>
      )}

      <Stack>
        {categories.map((cat) => {
          const stats = usage[cat.slug] ?? { count: 0, monthlyCost: 0 };

          if (editing === cat.id) {
            return (
              <Paper key={cat.id} variant="outlined" sx={{ p: 2, my: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <TextField
                    size="small"
                    fullWidth
                    autoFocus
                    label="Nom de la famille"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        run(() => RenameCategory(cat.id, draft));
                    }}
                  />
                  <Button
                    variant="contained"
                    disabled={pending || !draft.trim()}
                    onClick={() => run(() => RenameCategory(cat.id, draft))}
                  >
                    Enregistrer
                  </Button>
                  <Button color="inherit" onClick={reset}>
                    Annuler
                  </Button>
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                  {CATEGORY_PALETTE.map((color) => (
                    <Box
                      key={color}
                      component="button"
                      type="button"
                      aria-label={`Couleur ${color}`}
                      aria-pressed={cat.color === color}
                      disabled={pending}
                      onClick={() => run(() => RecolorCategory(cat.id, color))}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 1.5,
                        bgcolor: color,
                        border: 2,
                        borderColor: cat.color === color ? "text.primary" : "transparent",
                        cursor: "pointer",
                        p: 0,
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            );
          }

          return (
            <Box key={cat.id}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  py: 1.25,
                  px: 1,
                  borderRadius: 1.5,
                  "& + &": { boxShadow: "0 -1px 0 #1e2029" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                }}
              >
                <Box
                  component="button"
                  type="button"
                  aria-label={`Changer la couleur de ${cat.label}`}
                  onClick={() => {
                    setEditing(cat.id);
                    setDraft(cat.label);
                  }}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 1.5,
                    bgcolor: cat.color,
                    border: "1px solid rgba(255,255,255,0.14)",
                    flex: "none",
                    cursor: "pointer",
                    p: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    title={cat.label}
                    sx={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.label}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "#5c6675", mt: "1px" }}>
                    {stats.count === 0
                      ? "Aucun contrat — masquée dans le rail"
                      : `${stats.count} contrat${stats.count > 1 ? "s" : ""}`}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12.5,
                    color: "text.secondary",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stats.count ? `${formatEuro(Math.round(stats.monthlyCost))}/mois` : "—"}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setEditing(cat.id);
                      setDraft(cat.label);
                      setDeleting(null);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setDeleting(cat.id);
                      setEditing(null);
                      setReassign(
                        categories.find((c) => c.id !== cat.id)?.slug ??
                          NO_CATEGORY.slug,
                      );
                    }}
                  >
                    Supprimer
                  </Button>
                </Stack>
              </Stack>

              {deleting === cat.id && (
                <Paper variant="outlined" sx={{ p: 2, my: 1 }}>
                  <Typography
                    sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, mb: 0.75 }}
                  >
                    Supprimer «&nbsp;{cat.label}&nbsp;» ?
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}>
                    {stats.count
                      ? `${stats.count} contrat${stats.count > 1 ? "s utilisent" : " utilise"} cette famille. Choisis leur destination :`
                      : "Cette famille ne porte aucun contrat, la suppression est sans effet de bord."}
                  </Typography>
                  {stats.count > 0 && (
                    <TextField
                      select
                      size="small"
                      label="Destination des contrats"
                      value={reassign}
                      onChange={(e) => setReassign(e.target.value)}
                      sx={{ minWidth: 280, mb: 1.5 }}
                    >
                      {categories
                        .filter((c) => c.id !== cat.id)
                        .map((c) => (
                          <MenuItem key={c.id} value={c.slug}>
                            Déplacer vers «&nbsp;{c.label}&nbsp;»
                          </MenuItem>
                        ))}
                      <MenuItem value={NO_CATEGORY.slug}>
                        Laisser sans famille
                      </MenuItem>
                    </TextField>
                  )}
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={pending}
                      onClick={() => run(() => DeleteCategory(cat.id, reassign))}
                    >
                      Supprimer
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

      <Box sx={{ mt: 2.25, pt: 1.75, borderTop: 1, borderColor: "#1e2029" }}>
        {adding ? (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <TextField
              size="small"
              fullWidth
              autoFocus
              label="Nom de la nouvelle famille"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") run(() => CreateCategory(draft));
              }}
            />
            <Button
              variant="contained"
              disabled={pending || !draft.trim()}
              onClick={() => run(() => CreateCategory(draft))}
            >
              Créer
            </Button>
            <Button color="inherit" onClick={reset}>
              Annuler
            </Button>
          </Stack>
        ) : (
          <Button variant="outlined" size="small" onClick={() => setAdding(true)}>
            ＋ Nouvelle famille
          </Button>
        )}
      </Box>
    </Box>
  );
}
