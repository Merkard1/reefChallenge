import React from "react";
import { Box, Typography } from "@mui/material";
import { SalesReport } from "../model/types/SalesReport";

interface SalesHeaderProps {
  report: SalesReport;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({ report }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Summary
      </Typography>
      <Typography>Total Sales: ${report.totalSales.toFixed(2)}</Typography>
      <Typography>Number of Orders: {report.ordersCount}</Typography>
      <Typography>
        Average Order Value: ${report.averageOrderValue.toFixed(2)}
      </Typography>
    </Box>
  );
};
