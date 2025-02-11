import React, { ReactNode, useMemo } from "react";
import { Provider } from "react-redux";
import { ReducersMapObject } from "@reduxjs/toolkit";
import { StateSchema } from "../config/StateSchema";
import { createReduxStore } from "../config/store";

interface StoreProviderProps {
  children?: ReactNode;
  initialState?: Partial<StateSchema>;
  asyncReducers?: Partial<ReducersMapObject<StateSchema>>;
}

const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  initialState,
  asyncReducers,
}) => {
  const store = useMemo(
    () =>
      createReduxStore(
        initialState as StateSchema,
        asyncReducers as ReducersMapObject<StateSchema>
      ),
    [initialState, asyncReducers]
  );

  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
