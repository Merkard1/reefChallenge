import { Status } from "@/shared/const/types";
import { User } from "./User";

export interface UserSchema {
  user: User | null;
  status: Status;
  error: string | null;
}
