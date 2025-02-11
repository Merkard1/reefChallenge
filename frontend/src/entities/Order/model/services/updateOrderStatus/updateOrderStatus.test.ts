import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { updateOrderStatus } from "./updateOrderStatus";
import { OrderStatus } from "../../types/Order";

describe("updateOrderStatus thunk", () => {
  let dispatch: any;
  let getState: any;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();
    global.fetch = vi.fn();
  });

  it("should return updated order on successful fetch", async () => {
    const fakeOrder = {
      id: 123,
      customerName: "Alice",
      orderDate: "2025-02-10T00:00:00.000Z",
      status: "delivered",
      orderItems: [{ productId: 1, quantity: 2, price: 50 }],
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { updateOrderStatus: fakeOrder } }),
    });

    const args: { id: number; newStatus: OrderStatus } = {
      id: 123,
      newStatus: "delivered",
    };

    const action = await updateOrderStatus(args)(dispatch, getState, undefined);

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeOrder);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const fetchCallArgs = (global.fetch as unknown as Mock).mock.calls[0][1];
    const body = JSON.parse(fetchCallArgs.body);
    expect(body.variables).toEqual({ id: 123, status: "delivered" });
  });

  it("should reject with error text if response is not ok", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      text: async () => "Server error occurred",
    });

    const args: { id: number; newStatus: OrderStatus } = {
      id: 123,
      newStatus: "delivered",
    };
    const action = await updateOrderStatus(args)(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Server error occurred");
  });

  it("should reject with GraphQL error message if response contains errors", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "Mutation error" }] }),
    });

    const args: { id: number; newStatus: OrderStatus } = {
      id: 123,
      newStatus: "delivered",
    };
    const action = await updateOrderStatus(args)(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Mutation error");
  });

  it("should reject with error message if fetch throws an exception", async () => {
    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network error")
    );

    const args: { id: number; newStatus: OrderStatus } = {
      id: 123,
      newStatus: "delivered",
    };
    const action = await updateOrderStatus(args)(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error");
  });
});
