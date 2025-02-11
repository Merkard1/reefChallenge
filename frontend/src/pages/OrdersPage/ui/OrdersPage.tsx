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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    dispatch(
      fetchOrders({
        searchTerm: debouncedSearchTerm || undefined,
        status: filterStatus === "all" ? undefined : filterStatus,
      })
    );
  }, [debouncedSearchTerm, filterStatus, dispatch]);

  const handleCreateRandomOrder = async () => {
    try {
      await dispatch(createRandomOrder()).unwrap();

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
