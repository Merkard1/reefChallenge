import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductSchema } from "../types/ProductSchema";
import { Product } from "../types/Product";
import { fetchFilteredProducts } from "../services/fetchFilteredProducts/fetchFilteredProducts";
import { deleteProduct } from "../services/deleteProducts/deleteProduct";
import { updateProduct } from "../services/updateProduct/updateProduct";
import { createProduct } from "../services/createProducts/createProduct";

const initialState: ProductSchema = {
  status: "idle",
  editingProductId: null,
  productsList: [],
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.productsList = action.payload;
      state.status = "succeeded";
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.productsList.push(action.payload);
    },
    editProduct(state, action: PayloadAction<Product>) {
      const index = state.productsList.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.productsList[index] = action.payload;
      }
    },
    startEditingProduct(state, action: PayloadAction<number>) {
      state.editingProductId = action.payload;
    },
    stopEditingProduct(state) {
      state.editingProductId = null;
    },
    setStatus(state, action: PayloadAction<ProductSchema["status"]>) {
      state.status = action.payload;
    },
    deleteProduct(state, action: PayloadAction<number>) {
      state.productsList = state.productsList.filter(
        (p) => p.id !== action.payload
      );
      if (state.editingProductId === action.payload) {
        state.editingProductId = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFilteredProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.productsList = action.payload;
      })
      .addCase(fetchFilteredProducts.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        deleteProduct.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";
          state.productsList = state.productsList.filter(
            (p) => p.id !== action.payload
          );
        }
      )
      .addCase(deleteProduct.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updateProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        updateProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.status = "succeeded";
          const index = state.productsList.findIndex(
            (p) => p.id === action.payload.id
          );
          if (index !== -1) {
            state.productsList[index] = action.payload;
          }
        }
      )
      .addCase(updateProduct.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(createProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        createProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.status = "succeeded";
          state.productsList.push(action.payload);
        }
      )
      .addCase(createProduct.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { actions: productActions, reducer: productReducer } =
  productSlice;
