import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { fetchAdminDashboardData } from "./fetchAdminDashboardData";

describe("fetchAdminDashboardData thunk", () => {
  let dispatch: any;
  let getState: any;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();
    global.fetch = vi.fn();
  });

  it("should return admin dashboard data on successful fetch", async () => {
    const fakeDashboard = {
      metrics: [
        { label: "Total Revenue", value: 1000 },
        { label: "Orders Count", value: 10 },
        { label: "Avg Order Value", value: 100 },
      ],
      revenueOverTime: [
        { date: "2025-01-01", revenue: 500 },
        { date: "2025-01-02", revenue: 500 },
      ],
      topProductSales: [
        { productName: "Product One", sales: 600 },
        { productName: "Product Two", sales: 400 },
      ],
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { adminDashboard: fakeDashboard } }),
    });

    const action = await fetchAdminDashboardData()(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeDashboard);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should reject with error if GraphQL errors are returned", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "Query error" }] }),
    });

    const action = await fetchAdminDashboardData()(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");

    const rejectedAction = action as { error: { message: string } };
    expect(rejectedAction.error.message).toEqual("Query error");
  });

  it("should reject with error if fetch throws an exception", async () => {
    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network error")
    );

    const action = await fetchAdminDashboardData()(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    const rejectedAction = action as { error: { message: string } };
    expect(rejectedAction.error.message).toEqual("Network error");
  });
});
