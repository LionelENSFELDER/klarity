"use client";

import { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Collapse,
  Button,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {
  type DayDebit,
  type CalendarContract,
  formatEuro,
} from "@/modules/contracts/calendar";
import { getCategory, getFrequencyLabel } from "@/modules/contracts/categories";

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ContractRow({ contract }: { contract: CalendarContract }) {
  const [expanded, setExpanded] = useState(false);
  const category = getCategory(contract.category);

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        onClick={() => setExpanded((e) => !e)}
        sx={{
          p: 1.5,
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: category.color,
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {contract.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {category.label}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
        >
          {formatEuro(contract.amount)}
        </Typography>
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            color: "text.secondary",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 150ms",
          }}
        />
      </Stack>

      <Collapse in={expanded}>
        <Divider />
        <Stack spacing={1} sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.02)" }}>
          <DetailLine
            label="Référence"
            value={contract.contractNumber || "—"}
          />
          <DetailLine
            label="Fréquence"
            value={getFrequencyLabel(contract.frequency)}
          />
          <DetailLine
            label="Échéance / renouvellement"
            value={
              contract.renewalDate
                ? new Date(contract.renewalDate).toLocaleDateString("fr-FR")
                : "—"
            }
          />
          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <Button
              component={Link}
              href={`/contracts`}
              size="small"
              variant="outlined"
              startIcon={<OpenInNewIcon />}
            >
              Voir le contrat
            </Button>
            {contract.documentUrl && (
              <Button
                component="a"
                href={contract.documentUrl}
                download={contract.documentName ?? true}
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                Document
              </Button>
            )}
          </Stack>
        </Stack>
      </Collapse>
    </Box>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function DayDetailPanel({
  open,
  onClose,
  date,
  debit,
}: {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  debit: DayDebit | null;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 380 },
            bgcolor: "background.paper",
            backgroundImage: "none",
            p: 2.5,
          },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
            {date ? formatDate(date) : ""}
          </Typography>
          {debit && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: "var(--font-mono)",
                color: "text.secondary",
              }}
            >
              Total : {formatEuro(debit.total)}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Fermer">
          <CloseIcon />
        </IconButton>
      </Stack>

      {debit && debit.contracts.length > 0 ? (
        <Stack spacing={1.5}>
          {debit.contracts.map((c) => (
            <ContractRow key={c.id} contract={c} />
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="body2">Aucun prélèvement</Typography>
        </Box>
      )}
    </Drawer>
  );
}
