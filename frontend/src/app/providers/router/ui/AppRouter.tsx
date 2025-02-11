import React, { Suspense, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import { routeConfig } from "@/app/routeConfig/routeConfig";
import { AppRoutesProps } from "@/app/routeConfig/routeType";
import RequireAuth from "./RequireAuth";

const AppRouter: React.FC = () => {
  const renderWithWrapper = useCallback((route: AppRoutesProps) => {
    const element = (
      <Suspense fallback={<div>Loading...</div>}>{route.element}</Suspense>
    );
    if (route.authOnly) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={<RequireAuth roles={route.roles}>{element}</RequireAuth>}
        />
      );
    }
    return <Route key={route.path} path={route.path} element={element} />;
  }, []);

  return <Routes>{Object.values(routeConfig).map(renderWithWrapper)}</Routes>;
};

export default AppRouter;
