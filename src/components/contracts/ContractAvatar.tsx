import { Box } from "@mui/material";
import type { CalendarContract } from "@/modules/contracts/calendar";
import { categoryTint, type Category } from "@/modules/categories/model";
import ContractInlineIcon from "@/components/icons/ContratInlineIcon";

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("");
  return (letters.slice(0, 2) || "?").toUpperCase();
}

/**
 * Pastille d'un contrat : son icône si elle en a une, sinon ses initiales,
 * sur la teinte de sa catégorie. Les deux thèmes sont posés en CSS (classe
 * `.dark` sur <html>) : pas de lecture du mode côté client, pas d'écart
 * d'hydratation.
 */
export default function ContractAvatar({
  contract,
  category,
  size = 40,
}: {
  contract: Pick<CalendarContract, "name" | "iconType" | "iconValue">;
  category: Category;
  size?: number;
}) {
  const light = categoryTint(category.color, "light");
  const dark = categoryTint(category.color, "dark");
  const hasIcon = Boolean(contract.iconType && contract.iconValue);

  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: size >= 36 ? 3 : "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: light.bg,
        color: light.ink,
        fontWeight: 700,
        fontSize: size * 0.34,
        ".dark &": { bgcolor: dark.bg, color: dark.ink },
      }}
    >
      {hasIcon ? (
        <ContractInlineIcon
          iconType={contract.iconType}
          iconValue={contract.iconValue}
          name={contract.name}
        />
      ) : (
        initials(contract.name)
      )}
    </Box>
  );
}
