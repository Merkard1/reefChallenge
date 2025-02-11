import { Status } from "@/shared/const/types";
import { AdminDashboard } from "./AdminDashboard";

export interface AdminDashboardSchema {
  data: AdminDashboard | null;
  status: Status;
  error: string | null;
}
