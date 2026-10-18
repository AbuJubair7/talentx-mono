export enum UserRole {
  Employer = "Employer",
  Talent = "Talent",
  Guest = "Guest",
  Admin = "Admin",
}

export type Role = UserRole;

export const VALID_USER_ROLES: readonly UserRole[] = Object.values(UserRole);
