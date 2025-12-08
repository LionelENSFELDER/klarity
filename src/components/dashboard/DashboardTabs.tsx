"use client";

import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface DashboardTabsProps {
  overviewContent: React.ReactNode;
  contractsContent: React.ReactNode;
  analyticsContent: React.ReactNode;
  alertsContent: React.ReactNode;
}

export default function DashboardTabs({
  overviewContent,
  contractsContent,
  analyticsContent,
  alertsContent,
}: DashboardTabsProps) {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="dashboard tabs"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Tab label="Vue d'ensemble" />
        <Tab label="Contrats récents" />
        <Tab label="Analytics" />
        <Tab label="Alertes" />
      </Tabs>
      <TabPanel value={value} index={0}>
        {overviewContent}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {contractsContent}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {analyticsContent}
      </TabPanel>
      <TabPanel value={value} index={3}>
        {alertsContent}
      </TabPanel>
    </Box>
  );
}
