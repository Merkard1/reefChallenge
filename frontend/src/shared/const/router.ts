export enum AppRoutes {
  AdminDashboard = "adminDashboard",
  Login = "login",
  Registration = "registration",
  Orders = "orders",
  Products = "products",
  SalesReport = "salesReport",
}

export const getRouteAdminDashboard = () => "/admin-dashboard";
export const getRouteLogin = () => "/login";
export const getRouteRegistration = () => "/registration";
export const getRouteOrders = () => "/orders";
export const getRouteProducts = () => "/products";
export const getRouteSalesReport = () => "/sales-report";

export const AppRouteByPathPattern: Record<string, AppRoutes> = {
  [getRouteAdminDashboard()]: AppRoutes.AdminDashboard,
  [getRouteLogin()]: AppRoutes.Login,
  [getRouteRegistration()]: AppRoutes.Registration,
  [getRouteOrders()]: AppRoutes.Orders,
  [getRouteProducts()]: AppRoutes.Products,
  [getRouteSalesReport()]: AppRoutes.SalesReport,
};
