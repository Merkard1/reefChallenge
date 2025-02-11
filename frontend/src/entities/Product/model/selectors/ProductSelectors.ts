import { StateSchema } from "@/app/providers/StoreProvider";
import { buildSelector } from "@/shared/store/buildSelector";

export const [useProductsList, getProductsList] = buildSelector(
  (state: StateSchema) => state?.products?.productsList || []
);

export const [useProductsStatus, getProductsStatus] = buildSelector(
  (state: StateSchema) => state?.products?.status || "idle"
);

export const [useEditingProductId, getEditingProductId] = buildSelector(
  (state: StateSchema) => state?.products?.editingProductId
);
