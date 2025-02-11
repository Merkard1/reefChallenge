// OrdersPage.tsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  DynamicModuleLoader,
  ReducersList,
} from "@/shared/lib/DynamicModuleLoader/DynamicModuleLoader";
import { Button, Box, Container } from "@mui/material";

import { AppDispatch } from "@/app/providers/StoreProvider";
import {
  ordersReducer,
  getOrdersList,
  OrderStatus,
  fetchOrders,
  createRandomOrder,
  updateOrderStatus,
} from "@/entities/Order";
import { OrdersSearchAndFilter } from "./OrdersSearchAndFilter/OrdersSearchAndFilter";
import { useDebounce } from "@/shared/hooks/useDebounce/useDebounce";
import { AddRandomOrder } from "@/features/AddRandomOrder";

const reducers: ReducersList = {
  orders: ordersReducer,
};

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const ordersList = useSelector(getOrdersList);

  // Manage search and filter state in the parent.
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  // Debounce the search term to avoid too many server calls.
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Fetch orders from the backend whenever the debounced search term or filter status changes.
  useEffect(() => {
    dispatch(
      fetchOrders({
        searchTerm: debouncedSearchTerm || undefined,
        status: filterStatus === "all" ? undefined : filterStatus,
      })
    );
  }, [debouncedSearchTerm, filterStatus, dispatch]);

  // Handler to create a random order; then re-fetch the list.
  const handleCreateRandomOrder = async () => {
    try {
      await dispatch(createRandomOrder()).unwrap();
      // Optionally, re-fetch the list after creating a random order.
      dispatch(
        fetchOrders({
          searchTerm: debouncedSearchTerm || undefined,
          status: filterStatus === "all" ? undefined : filterStatus,
        })
      );
    } catch (error) {
      console.error("Failed to create random order:", error);
    }
  };

  const handleStatusChange = (id: number, newStatus: OrderStatus) => {
    dispatch(updateOrderStatus({ id, newStatus }));
  };

  return (
    <DynamicModuleLoader reducers={reducers} removeAfterUnmount={false}>
      <Container maxWidth="lg">
        <AddRandomOrder />
      </Container>

      <OrdersSearchAndFilter
        orders={ordersList}
        onStatusChange={handleStatusChange}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />
    </DynamicModuleLoader>
  );
};

export default OrdersPage;
