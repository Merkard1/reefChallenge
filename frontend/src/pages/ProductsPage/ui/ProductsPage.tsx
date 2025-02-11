import React from "react";
import {
  DynamicModuleLoader,
  ReducersList,
} from "@/shared/lib/DynamicModuleLoader/DynamicModuleLoader";
import { productReducer, Product, deleteProduct } from "@/entities/Product";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/providers/StoreProvider";
import { ProductSearchAndFilter } from "@/features/ProductSearchAndFilter";

const reducers: ReducersList = {
  products: productReducer,
};

const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleEdit = (product: Product) => {
    console.log("Editing product:", product);
  };

  const handleDelete = (id: number) => {
    console.log("Deleting product with id:", id);
    dispatch(deleteProduct(id));
  };

  return (
    <DynamicModuleLoader reducers={reducers} removeAfterUnmount={false}>
      <ProductSearchAndFilter onEdit={handleEdit} onDelete={handleDelete} />
    </DynamicModuleLoader>
  );
};

export default ProductsPage;
