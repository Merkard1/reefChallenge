import React from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Box,
  FormControl,
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Order, OrderStatus, OrderTableRow } from "@/entities/Order";
import { SearchBar } from "@/shared/ui/SearchBar/SearchBar";

interface OrdersSearchAndFilterProps {
  orders: Order[];
  onStatusChange: (id: number, newStatus: OrderStatus) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterStatus: OrderStatus | "all";
  onFilterStatusChange: (value: OrderStatus | "all") => void;
}

export const OrdersSearchAndFilter: React.FC<OrdersSearchAndFilterProps> = ({
  orders,
  onStatusChange,
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
}) => {
  const [sortAscending, setSortAscending] = React.useState(true);

  const sortedOrders = React.useMemo(() => {
    const arr = [...orders];
    arr.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      return sortAscending ? dateA - dateB : dateB - dateA;
    });
    return arr;
  }, [orders, sortAscending]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Order Management
      </Typography>

      <Box sx={{ mb: 2 }}>
        <SearchBar
          placeholder="Search Orders..."
          value={searchTerm}
          onChange={onSearchTermChange}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={filterStatus}
            onChange={(e) =>
              onFilterStatusChange(e.target.value as OrderStatus | "all")
            }
            size="small"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            Sort by Date
          </Typography>
          <IconButton onClick={() => setSortAscending(!sortAscending)}>
            {sortAscending ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
              />
            ))}
            {sortedOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};
