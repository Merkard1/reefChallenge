import { SalesDataPoint } from "./SalesDataPoint";
import { Order } from "@/entities/Order/model/types/Order";

export interface SalesReport {
  totalSales: number;
  ordersCount: number;
  averageOrderValue: number;
  dataPoints: SalesDataPoint[];
  orders: Order[];
}
