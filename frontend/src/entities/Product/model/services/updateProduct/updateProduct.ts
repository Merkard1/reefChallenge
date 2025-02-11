import { createAsyncThunk } from "@reduxjs/toolkit";
import { backPort } from "@/shared/const/back";
import { accessToken as aToken } from "@/shared/const/token";
import { Product } from "../../types/Product";

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (updatedProduct: Product, thunkAPI) => {
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
      const response = await fetch(backPort, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          query: `
            mutation UpdateProduct($id: Int!, $name: String, $description: String, $price: Float, $image: String) {
              updateProduct(
                id: $id, 
                name: $name, 
                description: $description, 
                price: $price, 
                image: $image
              ) {
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
          variables: {
            id: updatedProduct.id,
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            image: updatedProduct.imageUrl, // Map frontend "imageUrl" to backend "image"
          },
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

      return data.data.updateProduct;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Update failed");
    }
  }
);
