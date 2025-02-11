import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { Order } from "../../types/Order";

export const createRandomOrder = createAsyncThunk<Order, void>(
  "orders/createRandomOrder",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(backPort, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation {
              createRandomOrder {
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
      return data.data.createRandomOrder as Order;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to create random order"
      );
    }
  }
);
