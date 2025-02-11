import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { fetchFilteredProducts } from "./fetchFilteredProducts";
import { backPort } from "@/shared/const/back";

type FilterParams = {
  search: string;
  sortKey: string;
  order?: "asc" | "desc";
};

describe("fetchFilteredProducts thunk", () => {
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

  it("should return products on successful fetch without a token", async () => {
    const fakeProducts = [
      {
        id: 1,
        name: "Product A",
        description: "A great product",
        price: 100,
        image: "imageA.jpg",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        name: "Product B",
        description: "Another product",
        price: 200,
        image: "imageB.jpg",
        createdAt: "2025-01-02T00:00:00.000Z",
      },
    ];

    const mappedProducts = fakeProducts.map((p) => ({
      ...p,
      imageUrl: p.image,
    }));

    (global.localStorage.getItem as Mock).mockReturnValue(null);

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { productsFiltered: fakeProducts },
      }),
    });

    const params: FilterParams = {
      search: "test",
      sortKey: "name",
      order: "asc",
    };

    const action = await fetchFilteredProducts(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(mappedProducts);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url] = (global.fetch as unknown as Mock).mock.calls[0];
    expect(url).toContain(backPort);
    expect(url).toMatch(/\?_t=\d+/);

    const options = (global.fetch as unknown as Mock).mock.calls[0][1];
    const body = JSON.parse(options.body);
    expect(body.variables).toEqual(params);
  });

  it("should include Authorization header if token exists", async () => {
    const fakeToken = "mySecretToken";
    (global.localStorage.getItem as Mock).mockReturnValue(fakeToken);

    const fakeProducts = [
      {
        id: 1,
        name: "Product A",
        description: "A great product",
        price: 100,
        image: "imageA.jpg",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    ];
    const mappedProducts = fakeProducts.map((p) => ({
      ...p,
      imageUrl: p.image,
    }));

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { productsFiltered: fakeProducts },
      }),
    });

    const params: FilterParams = {
      search: "test",
      sortKey: "name",
      order: "asc",
    };

    const action = await fetchFilteredProducts(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(mappedProducts);

    const options = (global.fetch as unknown as Mock).mock.calls[0][1];
    expect(options.headers).toHaveProperty(
      "Authorization",
      `Bearer ${fakeToken}`
    );
  });

  it("should reject if response is not ok", async () => {
    (global.localStorage.getItem as Mock).mockReturnValue(null);

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
      text: async () => "Bad Request",
    });

    const params: FilterParams = {
      search: "test",
      sortKey: "name",
      order: "asc",
    };

    const action = await fetchFilteredProducts(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error: Bad Request");
  });

  it("should reject if GraphQL errors are returned", async () => {
    (global.localStorage.getItem as Mock).mockReturnValue(null);

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "GraphQL error occurred" }] }),
    });

    const params: FilterParams = {
      search: "test",
      sortKey: "name",
      order: "asc",
    };

    const action = await fetchFilteredProducts(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("GraphQL error occurred");
  });

  it("should reject if fetch throws an exception", async () => {
    (global.localStorage.getItem as Mock).mockReturnValue(null);

    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Fetch failed")
    );

    const params: FilterParams = {
      search: "test",
      sortKey: "name",
      order: "asc",
    };

    const action = await fetchFilteredProducts(params)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Fetch failed");
  });
});
