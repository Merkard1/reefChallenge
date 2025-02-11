import { createSlice } from "@reduxjs/toolkit";
import { OrdersSchema } from "../types/OrderSchema";
import { updateOrderStatus } from "../services/updateOrderStatus/updateOrderStatus";
import { fetchOrders } from "../services/fetchOrders/fetchOrders";
import { createRandomOrder } from "../services/createRandomOrder/createRandomOrder";

const initialState: OrdersSchema = {
  ordersList: [],
  status: "idle",
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ordersList = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    builder
      .addCase(createRandomOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createRandomOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ordersList.unshift(action.payload);
      })
      .addCase(createRandomOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedOrder = action.payload;
        const index = state.ordersList.findIndex(
          (o) => o.id === updatedOrder.id
        );
        if (index !== -1) {
          state.ordersList[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { reducer: ordersReducer } = ordersSlice;
