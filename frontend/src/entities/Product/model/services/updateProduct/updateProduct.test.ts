import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { updateProduct } from "./updateProduct";
import { backPort } from "@/shared/const/back";

const sampleProduct = {
  id: 1,
  name: "Test Product",
  description: "A test product",
  price: 100,
  image: "image.jpg",
};

describe("updateProduct thunk", () => {
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

  it("should update product successfully and return the updated product", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    const fakeUpdatedProduct = {
      id: 1,
      name: sampleProduct.name,
      description: sampleProduct.description,
      price: sampleProduct.price,
      image: sampleProduct.image,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-02T00:00:00.000Z",
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { updateProduct: fakeUpdatedProduct } }),
    });

    const action = await updateProduct(sampleProduct)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeUpdatedProduct);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (global.fetch as unknown as Mock).mock.calls[0];
    expect(url).toEqual(backPort);
    expect(options.method).toEqual("POST");
    expect(options.credentials).toEqual("include");
    expect(options.headers).toHaveProperty("Content-Type", "application/json");
    expect(options.headers).toHaveProperty(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    expect(options.headers).toHaveProperty("Pragma", "no-cache");

    expect(options.headers).toHaveProperty(
      "Authorization",
      `Bearer ${fakeToken}`
    );

    const body = JSON.parse(options.body);
    expect(body.variables).toEqual({
      id: sampleProduct.id,
      name: sampleProduct.name,
      description: sampleProduct.description,
      price: sampleProduct.price,
      image: sampleProduct.image,
    });
    expect(body.query).toContain("mutation UpdateProduct");
  });

  it("should reject with network error if response is not ok", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: async () => "Bad Request",
    });

    const action = await updateProduct(sampleProduct)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error: Bad Request");
  });

  it("should reject with GraphQL error message if response contains errors", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "GraphQL error occurred" }] }),
    });

    const action = await updateProduct(sampleProduct)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("GraphQL error occurred");
  });

  it("should reject with error message if fetch throws an exception", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Fetch failed")
    );

    const action = await updateProduct(sampleProduct)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Fetch failed");
  });
});
