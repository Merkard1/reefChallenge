import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Grid,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/providers/StoreProvider";
import { createProduct } from "@/entities/Product";

export const AddProduct: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
  }>({});

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateFields = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      price?: string;
      imageUrl?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (Number(price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const resultAction = await dispatch(
        createProduct({
          name,
          description,
          price: Number(price),
          image: imageUrl,
        })
      );

      if (createProduct.fulfilled.match(resultAction)) {
        setName("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        setErrors({});
      } else {
        setApiError(resultAction.payload as string);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        height: 300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Create New Product
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              error={Boolean(errors.description)}
              helperText={errors.description}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
              required
              error={Boolean(errors.price)}
              helperText={errors.price}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              fullWidth
              required
              error={Boolean(errors.imageUrl)}
              helperText={errors.imageUrl}
            />
          </Grid>
          {apiError && (
            <Grid item xs={12}>
              <Typography variant="body2" color="error">
                {apiError}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </CardActions>
    </Card>
  );
};
