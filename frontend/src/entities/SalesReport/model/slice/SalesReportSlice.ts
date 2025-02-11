import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SalesReport } from "../types/SalesReport";
import { fetchSalesReport } from "../services/fetchSalesReport";
import { SalesReportSchema } from "../types/SalesReportSchema";

const initialState: SalesReportSchema = {
  report: null,
  status: "idle",
  error: null,
};

const salesReportSlice = createSlice({
  name: "salesReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesReport.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchSalesReport.fulfilled,
        (state, action: PayloadAction<SalesReport>) => {
          state.status = "succeeded";
          state.report = action.payload;
        }
      )
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch sales report";
      });
  },
});

export const { reducer: salesReportReducer } = salesReportSlice;
