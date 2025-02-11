import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  DynamicModuleLoader,
  ReducersList,
} from "@/shared/lib/DynamicModuleLoader/DynamicModuleLoader";
import {
  adminDashboardReducer,
  fetchAdminDashboardData,
  getAdminDashboardData,
  getAdminDashboardStatus,
  getAdminDashboardError,
} from "@/entities/AdminDashboard";
import RevenueOverTimeChart from "./RevenueOverTimeChart";
import TopProductsChart from "./TopProductsChart";

const reducers: ReducersList = {
  adminDashboard: adminDashboardReducer,
};

const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const dashboardData = useSelector(getAdminDashboardData);
  const status = useSelector(getAdminDashboardStatus);
  const error = useSelector(getAdminDashboardError);

  useEffect(() => {
    dispatch(fetchAdminDashboardData() as any);
  }, [dispatch]);

  return (
    <DynamicModuleLoader reducers={reducers}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {status === "loading" && <CircularProgress />}
        {status === "failed" && (
          <Typography color="error">Error: {error}</Typography>
        )}

        {status === "succeeded" && dashboardData && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {dashboardData.metrics.map((metric, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2">{metric.label}</Typography>
                    <Typography variant="h5">{metric.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" gutterBottom>
              Revenue Over Time
            </Typography>
            <Box sx={{ width: "100%", height: 300, mb: 4 }}>
              <RevenueOverTimeChart data={dashboardData.revenueOverTime} />
            </Box>

            <Typography variant="h6" gutterBottom>
              Top Products
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              <TopProductsChart data={dashboardData.topProductSales} />
            </Box>
          </Box>
        )}
      </Container>
    </DynamicModuleLoader>
  );
};

export default AdminDashboardPage;
