import React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import {
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

interface StatsCardsProps {
  title: string;
  icon: string;
  line1: number | string;
}

const returnIcon = (icon: string) => {
  switch (icon) {
    case "DescriptionIcon":
      return <DescriptionIcon sx={{ color: "primary.main", fontSize: 30 }} />;
    case "TrendingUpIcon":
      return <TrendingUpIcon sx={{ color: "primary.main", fontSize: 30 }} />;
    case "AssessmentIcon":
      return <AssessmentIcon sx={{ color: "primary.main", fontSize: 30 }} />;
    case "WarningIcon":
      return <WarningIcon sx={{ color: "primary.main", fontSize: 30 }} />;
    default:
      return null;
  }
};

export default function StatsCard({ title, icon, line1 }: StatsCardsProps) {
  return (
    <Card sx={{ height: 150 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h5" color="text.secondary">
            {title}
          </Typography>
          <Box
            sx={{
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon ? returnIcon(icon) : null}
          </Box>
        </Stack>
        <Typography variant="h3" fontWeight={700} color="primary.main" mb={1}>
          {line1}
        </Typography>
      </CardContent>
    </Card>
  );
}
