import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { Order } from "../../types/Order";

interface FetchOrdersArgs {
  searchTerm?: string;
  status?: string;
}

export const fetchOrders = createAsyncThunk<
  Order[],
  FetchOrdersArgs | undefined
>("orders/fetchOrders", async (args, thunkAPI) => {
  const { searchTerm, status } = args || {};

  try {
    const response = await fetch(backPort, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
            query Orders($searchTerm: String, $status: String) {
              orders(searchTerm: $searchTerm, status: $status) {
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
        variables: {
          searchTerm: searchTerm || null,
          status: status || null,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return thunkAPI.rejectWithValue(errorText || "Server returned an error");
    }

    const data = await response.json();
    if (data.errors) {
      return thunkAPI.rejectWithValue(data.errors[0].message);
    }

    return data.data.orders as Order[];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch orders");
  }
});
