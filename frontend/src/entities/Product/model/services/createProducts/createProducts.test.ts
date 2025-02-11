import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { createProduct } from "./createProduct";
import { backPort } from "@/shared/const/back";

const sampleParams = {
  name: "Test Product",
  description: "Test Description",
  price: 99.99,
  image: "test.jpg",
};

describe("createProduct thunk", () => {
  let dispatch: any;
  let getState: any;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();

    global.fetch = vi.fn();

    global.localStorage = {
      getItem: vi.fn(),
    } as any;
  });

  it("should reject if no access token is found in localStorage", async () => {
    (global.localStorage.getItem as Mock).mockReturnValue(null);

    const action = await createProduct(sampleParams)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual(
      "No access token found. User is not logged in."
    );
  });

  it("should create a product on successful fetch", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    const fakeProduct = {
      id: 1,
      name: sampleParams.name,
      description: sampleParams.description,
      price: sampleParams.price,
      image: sampleParams.image,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { createProduct: fakeProduct } }),
    });

    const action = await createProduct(sampleParams)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeProduct);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (global.fetch as unknown as Mock).mock.calls[0];

    expect(url).toContain(backPort);
    expect(url).toMatch(/\?_t=\d+/);

    expect(options.method).toBe("POST");
    expect(options.headers).toHaveProperty(
      "Authorization",
      `Bearer ${fakeToken}`
    );
  });

  it("should reject with network error message if response is not ok", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
      text: async () => "Bad Request",
    });

    const action = await createProduct(sampleParams)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error: Bad Request");
  });

  it("should reject if GraphQL errors are returned", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "GraphQL error" }] }),
    });

    const action = await createProduct(sampleParams)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("GraphQL error");
  });

  it("should reject if fetch throws an exception", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Fetch failed")
    );

    const action = await createProduct(sampleParams)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Fetch failed");
  });
});
