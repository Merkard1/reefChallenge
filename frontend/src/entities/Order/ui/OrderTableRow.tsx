import React, { memo } from "react";
import { TableRow, TableCell, Select, MenuItem } from "@mui/material";
import { Order, OrderStatus } from "../model/types/Order";

interface OrderTableRowProps {
  order: Order;
  onStatusChange?: (orderId: number, newStatus: OrderStatus) => void;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = memo(
  ({ order, onStatusChange }) => {
    const handleStatusChange = (newStatus: OrderStatus) => {
      onStatusChange?.(order.id, newStatus);
    };

    return (
      <TableRow key={order.id}>
        <TableCell>{order.id}</TableCell>
        <TableCell>{order.customerName}</TableCell>
        <TableCell>{order.orderDate}</TableCell>
        <TableCell>
          <Select
            size="small"
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          <ul style={{ margin: 0, paddingLeft: "1em" }}>
            {order.orderItems.map((item, idx) => (
              <li key={idx}>
                {item.quantity} x Product {item.productId} @ ${item.price}
              </li>
            ))}
          </ul>
        </TableCell>
      </TableRow>
    );
  }
);
