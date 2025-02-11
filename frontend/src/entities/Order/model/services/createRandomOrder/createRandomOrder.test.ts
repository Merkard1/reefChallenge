import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { createRandomOrder } from "./createRandomOrder";

describe("createRandomOrder thunk", () => {
  let dispatch: any;
  let getState: any;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();
    global.fetch = vi.fn();
  });

  it("should return an order on successful fetch", async () => {
    const fakeOrder = {
      id: 1,
      customerName: "Alice",
      orderDate: "2025-01-01T00:00:00.000Z",
      status: "pending",
      orderItems: [{ productId: 1, quantity: 2, price: 100 }],
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { createRandomOrder: fakeOrder } }),
    });

    const action = await createRandomOrder()(dispatch, getState, undefined);

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeOrder);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should reject with error text if response is not ok", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      text: async () => "Server error occurred",
    });

    const action = await createRandomOrder()(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Server error occurred");
  });

  it("should reject with GraphQL error message if response contains errors", async () => {
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "Mutation error" }] }),
    });

    const action = await createRandomOrder()(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Mutation error");
  });

  it("should reject with error message if fetch throws an exception", async () => {
    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network error")
    );

    const action = await createRandomOrder()(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error");
  });
});
