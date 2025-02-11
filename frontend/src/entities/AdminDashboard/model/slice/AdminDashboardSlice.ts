import { buildSlice } from "@/shared/store/buildSlice";
import { AdminDashboardSchema } from "../types/AdminDashboardSchema";
import { fetchAdminDashboardData } from "../service/fetchAdminDashboardData";

const initialState: AdminDashboardSchema = {
  data: null,
  status: "idle",
  error: null,
};

export const adminDashboardSlice = buildSlice({
  name: "adminDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch dashboard data";
      });
  },
});

export const {
  actions: adminDashboardActions,
  reducer: adminDashboardReducer,
} = adminDashboardSlice;
