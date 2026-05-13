const ROLE_ADMIN = "admin";
const ROLE_OPERATOR = "operador";
const ROLE_TOURIST = "turista";

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const normalizeRole = (value: unknown): "admin" | "operador" | "turista" => {
  const text = normalizeText(value);
  if (["admin", "administrador", "administrador general"].includes(text)) {
    return ROLE_ADMIN;
  }
  if (
    [
      "operador",
      "prestador",
      "prestador servicio",
      "prestador de servicio",
      "prestador de servicios",
      "agencia",
      "agencia de viajes",
    ].includes(text)
  ) {
    return ROLE_OPERATOR;
  }
  return ROLE_TOURIST;
};

export const isAdminRole = (value: unknown) => normalizeRole(value) === ROLE_ADMIN;
export const isOperatorRole = (value: unknown) => normalizeRole(value) === ROLE_OPERATOR;
export const isOperatorOrAdminRole = (value: unknown) => {
  const role = normalizeRole(value);
  return role === ROLE_OPERATOR || role === ROLE_ADMIN;
};
