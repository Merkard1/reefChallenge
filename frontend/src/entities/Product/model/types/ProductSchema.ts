import { Status } from "@/shared/const/types";
import { Product } from "./Product";

export interface ProductSchema {
  productsList: Array<Product>;
  editingProductId: number | null;
  status: Status;
}
