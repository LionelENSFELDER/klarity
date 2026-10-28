import Link from "next/link";
import { Button } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOffRounded";
import StatusCard from "@/components/ui/StatusCard";

export default function NotFound() {
  return (
    <StatusCard
      icon={<SearchOffIcon />}
      tone="info"
      title="Page introuvable"
      message="Cette adresse ne mène nulle part. Le lien est peut-être ancien ou mal recopié."
      actions={
        <Button
          component={Link}
          href="/calendar"
          variant="contained"
          sx={{ flex: 1, borderRadius: 1, minHeight: 46 }}
        >
          Retour aux échéances
        </Button>
      }
    />
  );
}
