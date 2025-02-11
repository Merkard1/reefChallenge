import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { deleteProduct } from "./deleteProduct";
import { backPort } from "@/shared/const/back";

describe("deleteProduct thunk", () => {
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

  it("should reject if no access token is found", async () => {
    (global.localStorage.getItem as Mock).mockReturnValue(null);
    const productId = 42;

    const action = await deleteProduct(productId)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual(
      "No access token found. User is not logged in."
    );
  });

  it("should delete product and return the product id on success", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);
    const productId = 42;

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { deleteProduct: productId },
      }),
    });

    const action = await deleteProduct(productId)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(productId);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = (global.fetch as unknown as Mock).mock.calls[0];
    expect(url).toEqual(backPort);
    expect(options.method).toEqual("POST");
    expect(options.credentials).toEqual("include");
    expect(options.cache).toEqual("reload");
    expect(options.headers).toHaveProperty(
      "Authorization",
      `Bearer ${fakeToken}`
    );
    const body = JSON.parse(options.body);
    expect(body.variables).toEqual({ id: productId });
    expect(body.query).toContain("mutation DeleteProduct");
  });

  it("should reject with network error if response is not ok", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);
    const productId = 42;

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: async () => "Bad Request",
    });

    const action = await deleteProduct(productId)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error: Bad Request (status: 400)");
  });

  it("should reject with GraphQL error message if response contains errors", async () => {
    const fakeToken = "fakeToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);
    const productId = 42;

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ message: "GraphQL error occurred" }],
      }),
    });

    const action = await deleteProduct(productId)(
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
    const productId = 42;

    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Fetch failed")
    );

    const action = await deleteProduct(productId)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Fetch failed");
  });
});
