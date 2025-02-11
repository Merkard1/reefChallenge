import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { fetchSalesReport } from "./fetchSalesReport";
import { backPort } from "@/shared/const/back";

describe("fetchSalesReport thunk", () => {
  let dispatch: any;
  let getState: any;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();
    global.fetch = vi.fn();
  });

  it("should return sales report on successful fetch", async () => {
    const fakeSalesReport = {
      totalSales: 1000,
      ordersCount: 20,
      averageOrderValue: 50,
      dataPoints: [
        { date: "2025-01-01", totalSales: 500, ordersCount: 10 },
        { date: "2025-01-02", totalSales: 500, ordersCount: 10 },
      ],
      orders: [
        {
          id: 1,
          customerName: "Alice",
          orderDate: "2025-01-01T00:00:00.000Z",
          status: "pending",
          orderItems: [{ productId: 1, quantity: 2, price: 50 }],
        },
      ],
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { salesReport: fakeSalesReport } }),
    });

    const params = { startDate: "2025-01-01", endDate: "2025-01-31" };

    const action = await fetchSalesReport(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeSalesReport);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (global.fetch as unknown as Mock).mock.calls[0];
    expect(url).toContain(backPort);

    const body = JSON.parse(options.body);
    expect(body.variables).toEqual(params);
    expect(body.query).toContain(
      "query ($startDate: String!, $endDate: String!)"
    );
  });

  it("should reject if GraphQL errors are returned", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "GraphQL error occurred" }] }),
    });

    const params = { startDate: "2025-01-01", endDate: "2025-01-31" };

    const action = await fetchSalesReport(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");

    const rejectedAction = action as { error: { message: string } };
    expect(rejectedAction.error.message).toEqual("GraphQL error occurred");
  });

  it("should reject if fetch throws an exception", async () => {
    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network failure")
    );

    const params = { startDate: "2025-01-01", endDate: "2025-01-31" };

    const action = await fetchSalesReport(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    const rejectedAction = action as { error: { message: string } };
    expect(rejectedAction.error.message).toEqual("Network failure");
  });
});
