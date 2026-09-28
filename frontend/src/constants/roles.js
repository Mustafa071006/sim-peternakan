/**
 * Role identifiers as returned by the backend (`users.role` ENUM).
 */
export const ROLES = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
};

export const isAdmin = (role) => String(role || "").toLowerCase() === "admin";
export const isOperator = (role) =>
  String(role || "").toLowerCase() === "operator";
