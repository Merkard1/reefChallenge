export interface User {
  id: string;
  email: string;
  roles: UserRole[];
}

export type UserRole = "USER" | "ADMIN";
