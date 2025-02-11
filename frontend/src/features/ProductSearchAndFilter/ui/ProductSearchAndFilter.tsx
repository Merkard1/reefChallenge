import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { SortOption, SortSelector } from "@/features/SortSelector";
import { SearchBar } from "@/shared/ui/SearchBar/SearchBar";
import { AppDispatch } from "@/app/providers/StoreProvider";
import {
  Product,
  ProductCard,
  fetchFilteredProducts,
  getProductsList,
  getProductsStatus,
} from "@/entities/Product";
import { useDebounce } from "@/shared/hooks/useDebounce/useDebounce";
import { AddProduct } from "@/features/AddProduct";

interface ProductSearchAndFilterProps {
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

const productSortOptions: SortOption[] = [
  { label: "Name (A-Z)", value: "name" },
  { label: "Price (Low-High)", value: "price" },
  { label: "Created At (Oldest)", value: "createdAt" },
];

export const ProductSearchAndFilter: React.FC<ProductSearchAndFilterProps> = ({
  onEdit,
  onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const productsList = useSelector(getProductsList);
  const status = useSelector(getProductsStatus);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    dispatch(
      fetchFilteredProducts({ search: debouncedSearchTerm, sortKey, order })
    );
  }, [debouncedSearchTerm, sortKey, order, dispatch]);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Search &amp; Filter Products
      </Typography>
      <SearchBar
        placeholder="Search Products..."
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <SortSelector
          sortValue={sortKey}
          onChange={setSortKey}
          sortOptions={productSortOptions}
          label="Sort Products By"
        />
        <Button
          sx={{ height: "56px" }}
          variant="outlined"
          onClick={() => setOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
        >
          {order === "asc" ? "Ascending" : "Descending"}
        </Button>
      </Box>
      <AddProduct />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {status === "loading" && (
          <Typography align="center" sx={{ width: "100%" }}>
            Loading products...
          </Typography>
        )}
        {status === "succeeded" && productsList.length === 0 && (
          <Typography align="center" sx={{ width: "100%" }}>
            No products found.
          </Typography>
        )}
        {productsList.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductSearchAndFilter;
