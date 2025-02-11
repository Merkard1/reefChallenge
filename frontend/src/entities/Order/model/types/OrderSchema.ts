import { Status } from "@/shared/const/types";
import { Order } from "./Order";

export interface OrdersSchema {
  ordersList: Order[];
  status: Status;
  error: string | null;
}
