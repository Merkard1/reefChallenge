import { StateSchema } from "@/app/providers/StoreProvider";
import { buildSelector } from "@/shared/store/buildSelector";

export const [useOrdersList, getOrdersList] = buildSelector(
  (state: StateSchema) => state?.orders?.ordersList || []
);

export const [useOrdersStatus, getOrdersStatus] = buildSelector(
  (state: StateSchema) => state?.orders?.status || "idle"
);
