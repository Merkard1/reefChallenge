import { backPort } from "@/shared/const/back";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAdminDashboardData = createAsyncThunk(
  "adminDashboard/fetchAdminDashboard",
  async () => {
    const response = await fetch(backPort, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            adminDashboard {
              metrics {
                label
                value
              }
              revenueOverTime {
                date
                revenue
              }
              topProductSales {
                productName
                sales
              }
            }
          }
        `,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    return data.data.adminDashboard;
  }
);
