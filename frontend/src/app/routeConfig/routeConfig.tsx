import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { SalesReportPage } from "@/pages/SalesReportPage";
import { RegistrationPage } from "@/pages/RegistrationPage";
import {
  getRouteAdminDashboard,
  getRouteLogin,
  getRouteRegistration,
  getRouteOrders,
  getRouteProducts,
  getRouteSalesReport,
} from "@/shared/const/router";
import { AppRoutesProps } from "./routeType";
import { AppRoutes } from "@/shared/const/router";
import React from "react";

export const routeConfig: Record<AppRoutes, AppRoutesProps> = {
  [AppRoutes.Login]: {
    path: getRouteLogin(),
    element: <LoginPage />,
    authOnly: false,
  },
  [AppRoutes.Registration]: {
    path: getRouteRegistration(),
    element: <RegistrationPage />,
    authOnly: false,
  },
  [AppRoutes.AdminDashboard]: {
    path: getRouteAdminDashboard(),
    element: <AdminDashboardPage />,
    authOnly: true,
    roles: ["ADMIN"],
  },
  [AppRoutes.Orders]: {
    path: getRouteOrders(),
    element: <OrdersPage />,
    authOnly: true,
  },
  [AppRoutes.Products]: {
    path: getRouteProducts(),
    element: <ProductsPage />,
    authOnly: true,
  },
  [AppRoutes.SalesReport]: {
    path: getRouteSalesReport(),
    element: <SalesReportPage />,
    authOnly: true,
  },
};
