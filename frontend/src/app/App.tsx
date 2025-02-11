import React, { memo, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { Header } from "../widgets/Header";
import { Footer } from "../widgets/Footer";
import { useAppDispatch } from "@/shared/hooks/useAppDispatch/useAppDispatch";
import { useSelector } from "react-redux";
import { getUserStatus, initAuthData } from "@/entities/User";
import { AppRouter } from "./providers/router";
import { Notifications } from "@/features/Notifications";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#f50057" },
  },
});

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useSelector(getUserStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(initAuthData());
    }
  }, [dispatch, status]);

  if (status === "idle" || status === "loading") {
    return <div id="app">Loading app...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Notifications />
      <BrowserRouter>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <Header />
          <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
            <AppRouter />
          </Box>
          <Footer />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default memo(App);
