import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Snackbar, Alert } from "@mui/material";

export const Notifications: React.FC = () => {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:4444");

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("productCreated", (data) => {
      setMessage(`Product created: ${data}`);
      setOpen(true);
    });
    socket.on("productDeleted", (data) => {
      setMessage(`Product deleted: ${data}`);
      setOpen(true);
    });
    socket.on("orderStatusChanged", (data) => {
      setMessage(`Order updated: ${data}`);
      setOpen(true);
    });

    return () => {
      socket.close();
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert severity="info" onClose={handleClose} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notifications;
