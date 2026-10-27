import { User } from "@/types/auth";

export const ROLES = {
  SUBSCRIBER: "subscriber",
  CUSTOMER: "customer",
  DRIVER: "driver",
};

export const hasRole = (user: User | null, role: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

export const isDriver = (user: User | null): boolean => {
  return hasRole(user, ROLES.DRIVER);
};
