import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  DynamicModuleLoader,
  ReducersList,
} from "@/shared/lib/DynamicModuleLoader/DynamicModuleLoader";
import { AppDispatch } from "@/app/providers/StoreProvider";
import {
  getSalesReportData,
  getSalesReportStatus,
  getSalesReportError,
  salesReportReducer,
  fetchSalesReport,
  SalesHeader,
  SalesChart,
} from "@/entities/SalesReport";

const reducers: ReducersList = {
  salesReport: salesReportReducer,
};

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const SalesReportPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const report = useSelector(getSalesReportData);
  const status = useSelector(getSalesReportStatus);
  const error = useSelector(getSalesReportError);

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [startDate, setStartDate] = useState<string>(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState<string>(formatDate(today));

  const handleFetchReport = () => {
    dispatch(fetchSalesReport({ startDate, endDate }));
  };

  return (
    <DynamicModuleLoader reducers={reducers}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sales Report
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleFetchReport}>
            Fetch Report
          </Button>
        </Box>

        {status === "loading" && <CircularProgress />}
        {status === "failed" && (
          <Typography color="error">Error: {error}</Typography>
        )}

        {report && status === "succeeded" && (
          <Box>
            <SalesHeader report={report} />
            <SalesChart data={report.dataPoints} />
          </Box>
        )}
      </Container>
    </DynamicModuleLoader>
  );
};

export default SalesReportPage;
