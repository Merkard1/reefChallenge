import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { accessToken } from "@/shared/const/token";

interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  image: string;
}

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (params: CreateProductParams, thunkAPI) => {
    const token = localStorage.getItem(accessToken);
    if (!token) {
      return thunkAPI.rejectWithValue(
        "No access token found. User is not logged in."
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      Authorization: `Bearer ${token}`,
    };

    const url = `${backPort}?_t=${Date.now()}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          query: `
            mutation CreateProduct($name: String!, $description: String!, $price: Float!, $image: String!) {
              createProduct(name: $name, description: $description, price: $price, image: $image) {
                id
                name
                description
                price
                image
                createdAt
                updatedAt
              }
            }
          `,
          variables: params,
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

      return data.data.createProduct;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred.");
    }
  }
);
