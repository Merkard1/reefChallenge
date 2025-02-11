import React from "react";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { createRandomOrder } from "@/entities/Order";
import { AppDispatch } from "@/app/providers/StoreProvider";

export const AddRandomOrder: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleClick = async () => {
    try {
      const newOrder = await dispatch(createRandomOrder()).unwrap();
      console.log("Random order created:", newOrder);
    } catch (error) {
      console.error("Failed to create random order:", error);
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={handleClick}>
      Create Random Order
    </Button>
  );
};
