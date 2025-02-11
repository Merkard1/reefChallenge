import { useUser } from "@/entities/User";
import {
  getRouteAdminDashboard,
  getRouteLogin,
  getRouteOrders,
  getRouteProducts,
  getRouteSalesReport,
} from "@/shared/const/router";
import { HeaderItemType } from "../types/Header";
import { ProductsPage } from "@/pages/ProductsPage";
import { LoginPage } from "@/pages/LoginPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { SalesReportPage } from "@/pages/SalesReportPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";

export const useSidebarItems = () => {
  const userData = useUser();
  const headerItemsList: HeaderItemType[] = [];

  if (!userData) {
    headerItemsList.push({
      path: getRouteLogin(),
      component: LoginPage,
      text: "Login",
    });
  } else {
    headerItemsList.push(
      {
        path: getRouteProducts(),
        component: ProductsPage,
        text: "Products",
        authOnly: true,
      },
      {
        path: getRouteOrders(),
        component: OrdersPage,
        text: "Orders",
        authOnly: true,
      },
      {
        path: getRouteSalesReport(),
        component: SalesReportPage,
        text: "Sales",
        authOnly: true,
      }
    );

    if (userData.roles && userData.roles.includes("ADMIN")) {
      headerItemsList.push({
        path: getRouteAdminDashboard(),
        component: AdminDashboardPage,
        text: "Admin",
        authOnly: true,
      });
    }
  }

  return headerItemsList;
};
