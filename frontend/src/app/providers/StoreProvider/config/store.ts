import { configureStore, ReducersMapObject } from "@reduxjs/toolkit";
import { createReducerManager } from "./reducerManager";
import { StateSchema } from "./StateSchema";
import { userReducer } from "@/entities/User";

export function createReduxStore(
  initialState?: StateSchema,
  asyncReducers?: ReducersMapObject<StateSchema>
) {
  const rootReducers: ReducersMapObject<StateSchema> = {
    ...asyncReducers,
    user: userReducer,
  };

  const reducerManager = createReducerManager(rootReducers);

  const store = configureStore({
    // @ts-expect-error
    reducer: reducerManager.reduce,
    preloadedState: initialState,
    devTools: true,
    // if needed: middleware: ...
  });

  // @ts-expect-error
  store.reducerManager = reducerManager;
  return store;
}

export type RootState = ReturnType<typeof createReduxStore>;
export type AppDispatch = ReturnType<typeof createReduxStore>["dispatch"];
