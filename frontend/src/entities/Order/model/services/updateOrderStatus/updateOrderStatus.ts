import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { Order, OrderStatus } from "../../types/Order";

interface UpdateOrderStatusArgs {
  id: number;
  newStatus: OrderStatus;
}

export const updateOrderStatus = createAsyncThunk<Order, UpdateOrderStatusArgs>(
  "orders/updateOrderStatus",
  async ({ id, newStatus }, thunkAPI) => {
    try {
      const response = await fetch(backPort, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation UpdateOrderStatus($id: Int!, $status: String!) {
              updateOrderStatus(id: $id, status: $status) {
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
          `,
          variables: { id, status: newStatus },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return thunkAPI.rejectWithValue(
          errorText || "Server returned an error"
        );
      }

      const data = await response.json();
      if (data.errors) {
        return thunkAPI.rejectWithValue(data.errors[0].message);
      }

      return data.data.updateOrderStatus as Order;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to update order status"
      );
    }
  }
);
