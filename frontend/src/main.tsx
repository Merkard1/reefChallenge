import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import CssBaseline from "@mui/material/CssBaseline";

import { StoreProvider } from "./app/providers/StoreProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <CssBaseline />
      <App />
    </StoreProvider>
  </React.StrictMode>
);
