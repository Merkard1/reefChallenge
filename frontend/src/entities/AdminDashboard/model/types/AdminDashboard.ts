import { ProductSalesDataPoint } from "./ProductSalesDataPoint";
import { RevenueDataPoint } from "./SalesDataPoint";

export interface Metric {
  label: string;
  value: number;
}

export interface AdminDashboard {
  metrics: Metric[];
  revenueOverTime: RevenueDataPoint[];
  topProductSales: ProductSalesDataPoint[];
}
