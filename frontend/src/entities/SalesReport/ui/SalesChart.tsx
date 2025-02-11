import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Box } from "@mui/material";
import { SalesDataPoint } from "../model/types/SalesDataPoint";

interface SalesChartProps {
  data: SalesDataPoint[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <Box sx={{ mt: 3, height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            yAxisId="left"
            label={{ value: "Total Sales", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Orders Count",
              angle: 90,
              position: "insideRight",
            }}
          />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="totalSales"
            stroke="#8884d8"
            strokeWidth={2}
            name="Total Sales"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ordersCount"
            stroke="#82ca9d"
            strokeWidth={2}
            name="Orders Count"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
