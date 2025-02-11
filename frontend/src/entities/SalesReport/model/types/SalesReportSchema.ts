import { Status } from "@/shared/const/types";
import { SalesReport } from "./SalesReport";

export interface SalesReportSchema {
  report: SalesReport | null;
  status: Status;
  error: string | null;
}
