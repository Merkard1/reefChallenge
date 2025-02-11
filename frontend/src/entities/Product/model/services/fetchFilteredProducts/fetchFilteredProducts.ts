import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { accessToken as aToken } from "@/shared/const/token";

interface FilterParams {
  search?: string;
  sortKey?: string;
  order?: "asc" | "desc";
}

export const fetchFilteredProducts = createAsyncThunk(
  "products/fetchFilteredProducts",
  async (params: FilterParams, thunkAPI) => {
    const { search, sortKey, order } = params;

    const url = `${backPort}?_t=${Date.now()}`;

    const token = localStorage.getItem(aToken);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          query: `
            query($search: String, $sortKey: String, $order: String) {
              productsFiltered(search: $search, sortKey: $sortKey, order: $order) {
                id
                name
                description
                price
                image
                createdAt
              }
            }
          `,
          variables: { search, sortKey, order },
        }),
      });

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          `Network error: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.errors && data.errors.length > 0) {
        return thunkAPI.rejectWithValue(data.errors[0].message);
      }

      const products = data.data.productsFiltered.map((p: any) => ({
        ...p,
        imageUrl: p.image,
      }));

      return products;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred.");
    }
  }
);
