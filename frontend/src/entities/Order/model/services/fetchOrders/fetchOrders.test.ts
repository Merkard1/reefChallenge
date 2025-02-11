import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { fetchOrders } from "./fetchOrders";

describe("fetchOrders thunk", () => {
  let dispatch: any;
  let getState: any;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();
    global.fetch = vi.fn();
  });

  it("should return orders on successful fetch with no arguments", async () => {
    const fakeOrders = [
      {
        id: 1,
        customerName: "Alice",
        orderDate: "2025-01-01T00:00:00.000Z",
        status: "pending",
        orderItems: [{ productId: 1, quantity: 2, price: 100 }],
      },
      {
        id: 2,
        customerName: "Bob",
        orderDate: "2025-01-02T00:00:00.000Z",
        status: "delivered",
        orderItems: [{ productId: 2, quantity: 1, price: 50 }],
      },
    ];

    // Simulate a successful response returning our fakeOrders.
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          orders: fakeOrders,
        },
      }),
    });

    const action = await fetchOrders()(dispatch, getState, undefined);

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeOrders);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should use provided arguments in the request body", async () => {
    const args = { searchTerm: "test", status: "pending" };
    const fakeOrders = [
      {
        id: 1,
        customerName: "Alice",
        orderDate: "2025-01-01T00:00:00.000Z",
        status: "pending",
        orderItems: [{ productId: 1, quantity: 2, price: 100 }],
      },
    ];

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          orders: fakeOrders,
        },
      }),
    });

    const action = await fetchOrders(args)(dispatch, getState, undefined);
    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeOrders);

    const fetchCallArgs = (global.fetch as unknown as Mock).mock.calls[0][1];
    const body = JSON.parse(fetchCallArgs.body);
    expect(body.variables).toEqual({ searchTerm: "test", status: "pending" });
  });

  it("should reject with error text if response is not ok", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      text: async () => "Server error occurred",
    });

    const action = await fetchOrders()(dispatch, getState, undefined);
    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Server error occurred");
  });

  it("should reject with GraphQL error message if response contains errors", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "Query error" }] }),
    });

    const action = await fetchOrders()(dispatch, getState, undefined);
    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Query error");
  });

  it("should reject with error message if fetch throws an exception", async () => {
    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network error")
    );

    const action = await fetchOrders()(dispatch, getState, undefined);
    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error");
  });
});
