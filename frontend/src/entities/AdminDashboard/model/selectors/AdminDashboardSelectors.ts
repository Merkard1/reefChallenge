import { StateSchema } from "@/app/providers/StoreProvider";
import { buildSelector } from "@/shared/store/buildSelector";

export const [useAdminDashboardData, getAdminDashboardData] = buildSelector(
  (state: StateSchema) => state?.adminDashboard?.data || null
);

export const [useAdminDashboardStatus, getAdminDashboardStatus] = buildSelector(
  (state: StateSchema) => state?.adminDashboard?.status || "idle"
);

export const [useAdminDashboardError, getAdminDashboardError] = buildSelector(
  (state: StateSchema) => state?.adminDashboard?.error || null
);
