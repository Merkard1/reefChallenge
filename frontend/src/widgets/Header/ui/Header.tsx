import React, { useMemo } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import {
  getRouteAdminDashboard,
  getRouteLogin,
  getRouteOrders,
  getRouteProducts,
  getRouteSalesReport,
} from "@/shared/const/router";
import { useSelector, useDispatch } from "react-redux";
import { getUser, userActions } from "@/entities/User";
import { AppDispatch } from "@/app/providers/StoreProvider";
import { useSidebarItems } from "../model/selectors/HeaderSelectors";
import { HeaderItem } from "./HeaderItem";

export const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(getUser);

  const sidebarItemsList = useSidebarItems();

  const handleLogout = () => {
    dispatch(userActions.logoutUser());
  };

  const itemsList = useMemo(
    () =>
      sidebarItemsList.map((item) => (
        <HeaderItem item={item} key={item.path} />
      )),
    [sidebarItemsList]
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ReefChallenge
        </Typography>
        {itemsList}
        {user?.id && (
          <Button
            sx={{ paddingLeft: 4 }}
            color="inherit"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
