import { StateSchema } from "@/app/providers/StoreProvider";
import { buildSelector } from "@/shared/store/buildSelector";

export const [useUser, getUser] = buildSelector(
  (state: StateSchema) => state?.user?.user
);

export const [useUserError, getUserError] = buildSelector(
  (state: StateSchema) => state?.user?.error
);

export const [useUserStatus, getUserStatus] = buildSelector(
  (state: StateSchema) => state?.user?.status || "idle"
);
