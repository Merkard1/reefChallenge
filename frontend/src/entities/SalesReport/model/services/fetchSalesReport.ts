import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { SalesReport } from "../types/SalesReport";

interface SalesReportArgs {
  startDate: string;
  endDate: string;
}

export const fetchSalesReport = createAsyncThunk<SalesReport, SalesReportArgs>(
  "salesReport/fetchSalesReport",
  async ({ startDate, endDate }, thunkAPI) => {
    const response = await fetch(backPort, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query ($startDate: String!, $endDate: String!) {
            salesReport(startDate: $startDate, endDate: $endDate) {
              totalSales
              ordersCount
              averageOrderValue
              dataPoints {
                date
                totalSales
                ordersCount
              }
              orders {
                id
                customerName
                orderDate
                status
                orderItems {
                  productId
                  quantity
                  price
                }
              }
            }
          }
        `,
        variables: { startDate, endDate },
      }),
    });
    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    return data.data.salesReport as SalesReport;
  }
);
