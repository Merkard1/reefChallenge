import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { accessToken } from "@/shared/const/token";

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: number, thunkAPI) => {
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

    try {
      const response = await fetch(backPort, {
        method: "POST",
        credentials: "include",
        headers,
        cache: "reload",
        body: JSON.stringify({
          query: `
            mutation DeleteProduct($id: Int!) {
              deleteProduct(id: $id)
            }
          `,
          variables: { id },
        }),
      });

      if (!response.ok) {
        return thunkAPI.rejectWithValue(
          `Network error: ${response.statusText} (status: ${response.status})`
        );
      }

      const data = await response.json();

      if (data.errors && data.errors.length > 0) {
        return thunkAPI.rejectWithValue(data.errors[0].message);
      }

      return id;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("An unknown error occurred.");
    }
  }
);
