export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "idle"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  orderItems: OrderItem[];
}
