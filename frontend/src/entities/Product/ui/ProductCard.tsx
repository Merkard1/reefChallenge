import React, { memo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import {
  updateProduct,
  productActions,
  getEditingProductId,
  Product,
} from "@/entities/Product";
import { AppDispatch } from "@/app/providers/StoreProvider";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = memo(
  ({ product, onEdit, onDelete }) => {
    const dispatch = useDispatch<AppDispatch>();
    const editingProductId = useSelector(getEditingProductId);
    const isEditing = editingProductId === product.id;

    const [editName, setEditName] = useState(product.name);
    const [editDescription, setEditDescription] = useState(product.description);
    const [editPrice, setEditPrice] = useState(product.price);
    const [editImageUrl, setEditImageUrl] = useState(product.imageUrl);

    useEffect(() => {
      if (isEditing) {
        setEditName(product.name);
        setEditDescription(product.description);
        setEditPrice(product.price);
        setEditImageUrl(product.imageUrl);
      }
    }, [isEditing, product]);

    const handleStartEdit = () => {
      dispatch(productActions.startEditingProduct(product.id));
    };

    const handleCancelEdit = () => {
      dispatch(productActions.stopEditingProduct());
    };

    const handleSave = () => {
      const updated: Product = {
        ...product,
        name: editName,
        description: editDescription,
        price: editPrice,
        imageUrl: editImageUrl,
      };
      if (onEdit) onEdit(updated);
      dispatch(updateProduct(updated));
      dispatch(productActions.stopEditingProduct());
    };

    const handleDelete = () => {
      if (onDelete) {
        onDelete(product.id);
      } else {
        dispatch(productActions.deleteProduct(product.id));
      }
    };

    if (!isEditing) {
      return (
        <Card
          sx={{
            height: 330,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <CardMedia
            component="img"
            height="140"
            image={product.imageUrl}
            alt={product.name}
          />
          <CardContent>
            <Typography variant="h5">{product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {product.description}
            </Typography>
            <Typography variant="h6">${product.price}</Typography>
          </CardContent>
          <CardActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button variant="contained" size="small" onClick={handleStartEdit}>
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      );
    } else {
      return (
        <Card
          sx={{
            height: 330,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <TextField
                label="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <TextField
                label="Price"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
              />
              <TextField
                label="Image URL"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />
            </Box>
          </CardContent>
          <CardActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button variant="contained" size="small" onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </CardActions>
        </Card>
      );
    }
  }
);

export default ProductCard;
